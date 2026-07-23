import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsRoot = path.join(root, "src", "content", "posts");
const dynamicRoot = path.join(root, "src", "content", "dynamic");
const pagePostsRoot = path.join(root, "src", "pages", "posts");
const errors = [];

function walk(directory) {
	if (!fs.existsSync(directory)) return [];
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(fullPath) : [fullPath];
	});
}

function relative(filePath) {
	return path.relative(root, filePath).replaceAll("\\", "/");
}

function parseMarkdown(filePath) {
	const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
	if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
		errors.push(`${relative(filePath)} must start with frontmatter on the first line`);
		return null;
	}

	const frontmatterEnd = content.search(/\r?\n---\r?\n/);
	if (frontmatterEnd < 3) {
		errors.push(`${relative(filePath)} has no closing frontmatter delimiter`);
		return null;
	}

	return {
		content,
		frontmatter: content.slice(0, frontmatterEnd),
	};
}

function resolveLocalImage(filePath, rawTarget) {
	let target = rawTarget.trim().replace(/^<|>$/g, "");
	if (!target || /^(?:https?:|data:|blob:|#)/i.test(target)) return null;

	target = target.split(/[?#]/, 1)[0];
	try {
		target = decodeURIComponent(target);
	} catch {
		// Keep the original target so the validation error points to what was written.
	}

	if (target.startsWith("/")) {
		return path.join(root, "public", target.replace(/^\/+/, ""));
	}
	if (target.startsWith("@/")) {
		return path.join(root, "src", target.slice(2));
	}
	if (/^(?:src|public)[/\\]/.test(target)) {
		return path.join(root, target);
	}
	return path.resolve(path.dirname(filePath), target);
}

function validateLocalImages(filePath, content, frontmatter) {
	const targets = new Set();
	const frontmatterImage = frontmatter.match(
		/^image:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))/m,
	);
	if (frontmatterImage) {
		targets.add(frontmatterImage[1] || frontmatterImage[2] || frontmatterImage[3]);
	}

	for (const match of content.matchAll(/!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))/g)) {
		targets.add(match[1] || match[2]);
	}
	for (const match of content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
		targets.add(match[1]);
	}

	for (const target of targets) {
		const resolved = resolveLocalImage(filePath, target);
		if (resolved && !fs.existsSync(resolved)) {
			errors.push(`${relative(filePath)} references missing image: ${target}`);
		}
	}
}

for (const filePath of walk(path.join(root, "src"))) {
	if (/\.md\.mdx?$/i.test(filePath)) {
		errors.push(`${relative(filePath)} uses a duplicated Markdown extension`);
	}
}

for (const filePath of walk(pagePostsRoot)) {
	if (/\.mdx?$/i.test(filePath)) {
		errors.push(
			`${relative(filePath)} is a Markdown page; blog posts belong in src/content/posts/`,
		);
	}
}

for (const filePath of walk(postsRoot)) {
	if (!/\.mdx?$/i.test(filePath)) continue;

	const parsed = parseMarkdown(filePath);
	if (!parsed) continue;
	const { content, frontmatter } = parsed;
	for (const field of ["title", "published", "draft"]) {
		if (!new RegExp(`^${field}:\\s*\\S`, "m").test(frontmatter)) {
			errors.push(`${relative(filePath)} is missing required frontmatter: ${field}`);
		}
	}

	const passwordValue =
		frontmatter
			.match(/^password:\s*(.*)$/m)?.[1]
			.trim()
			.replace(/^(["'])(.*)\1$/, "$2") ?? "";
	const encrypted = passwordValue.length > 0;
	const hasSecretHistories = /\bsecretHistories\b/.test(frontmatter);
	if (encrypted && !hasSecretHistories) {
		errors.push(
			`${relative(filePath)} is encrypted but does not include secretHistories`,
		);
	}
	if (!encrypted && hasSecretHistories) {
		errors.push(
			`${relative(filePath)} uses secretHistories without an article password`,
		);
	}
	validateLocalImages(filePath, content, frontmatter);
}

for (const filePath of walk(dynamicRoot)) {
	if (!/\.mdx?$/i.test(filePath)) continue;

	const parsed = parseMarkdown(filePath);
	if (!parsed) continue;
	const { content, frontmatter } = parsed;
	if (!/^published:\s*\S/m.test(frontmatter)) {
		errors.push(`${relative(filePath)} is missing required frontmatter: published`);
	}
	validateLocalImages(filePath, content, frontmatter);
}

if (errors.length > 0) {
	console.error("Content validation failed:\n");
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log("Content paths, frontmatter, and local images look valid.");
