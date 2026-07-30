import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputRoot = path.resolve(root, process.argv[2] || "dist");

function normalizeBase(value) {
	const normalized = (value || "/").trim();
	if (!normalized || normalized === "/") return "/";
	return `/${normalized.replace(/^\/+|\/+$/g, "")}/`;
}

function inferGithubPagesBase() {
	if (process.env.GITHUB_ACTIONS !== "true") return "/";
	const [owner, repository] = (process.env.GITHUB_REPOSITORY || "").split("/");
	if (!owner || !repository || repository === `${owner}.github.io`) return "/";
	return `/${repository}/`;
}

const expectedBase = normalizeBase(
	process.env.BASE_PATH || inferGithubPagesBase(),
);

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(fullPath) : [fullPath];
	});
}

function lineNumber(content, index) {
	return content.slice(0, index).split("\n").length;
}

function isBaseAware(reference) {
	if (expectedBase === "/") return true;
	const pathname = reference.split(/[?#]/, 1)[0];
	return (
		pathname === expectedBase.slice(0, -1) || pathname.startsWith(expectedBase)
	);
}

if (!fs.existsSync(outputRoot)) {
	console.error(
		`Pages base-path validation failed: output directory not found: ${outputRoot}`,
	);
	process.exit(1);
}

const findings = new Map();
const patterns = [
	{
		kind: "HTML attribute",
		re: /\b(?:href|src|action|poster|data-(?:src|url|href|path|home-path|archive-path))\s*=\s*["'](\/(?!\/)[^"']*)["']/gi,
	},
	{
		kind: "CSS url()",
		re: /url\(\s*["']?(\/(?!\/)[^)"']+)["']?\s*\)/gi,
	},
	{
		kind: "redirect URL",
		re: /(?:^|[;,\s])url=(\/(?!\/)[^\s;"']+)/gi,
	},
	{
		kind: "script fetch/import",
		re: /\b(?:fetch|import)\(\s*["'`](\/(?!\/)[^"'`]+)["'`]/gi,
	},
	{
		kind: "script property",
		re: /\.(?:src|href|action)\s*=\s*["'`](\/(?!\/)[^"'`]+)["'`]/gi,
	},
	{
		kind: "script URL",
		re: /new URL\(\s*["'`](\/(?!\/)[^"'`]+)["'`]/gi,
	},
];

for (const filePath of walk(outputRoot)) {
	if (!/[.](?:html|css|js)$/i.test(filePath)) continue;
	const content = fs.readFileSync(filePath, "utf8");
	for (const { kind, re } of patterns) {
		re.lastIndex = 0;
		for (const match of content.matchAll(re)) {
			const reference = match[1];
			if (isBaseAware(reference)) continue;
			const relativePath = path
				.relative(outputRoot, filePath)
				.replaceAll("\\", "/");
			const line = lineNumber(content, match.index);
			const key = `${relativePath}:${line}:${kind}:${reference}`;
			findings.set(key, { file: relativePath, line, kind, reference });
		}
	}
}

if (findings.size > 0) {
	console.error(
		`Pages base-path validation failed: ${findings.size} root-relative reference(s) do not start with ${expectedBase}`,
	);
	for (const finding of [...findings.values()].slice(0, 100)) {
		console.error(
			`- ${finding.file}:${finding.line} [${finding.kind}] ${finding.reference}`,
		);
	}
	if (findings.size > 100) {
		console.error(`- ... ${findings.size - 100} more finding(s)`);
	}
	process.exit(1);
}

console.log(`Pages base-path references look valid for ${expectedBase}`);
