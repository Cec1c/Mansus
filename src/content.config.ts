import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { aspectIds } from "@/data/aspects";

const aspectIdSchema = z.enum(aspectIds);
const validAspectIds = aspectIds as readonly string[];

const stringListSchema = z.preprocess(
	(value) =>
		Array.isArray(value)
			? value
					.filter((item): item is string => typeof item === "string")
					.map((item) => item.trim())
					.filter(Boolean)
			: [],
	z.array(z.string()),
);

const dateValueSchema = z.preprocess((value) => {
	if (value instanceof Date) return value;
	if (typeof value !== "string") return value;

	const trimmed = value.trim();
	if (!trimmed) return value;

	const parsed = new Date(trimmed);
	return Number.isNaN(parsed.getTime()) ? value : parsed;
}, z.date());

const optionalDateValueSchema = z.preprocess((value) => {
	if (value === null || value === undefined) return undefined;
	if (typeof value === "string" && value.trim() === "") return undefined;
	if (value instanceof Date) return value;

	if (typeof value === "string") {
		const parsed = new Date(value.trim());
		return Number.isNaN(parsed.getTime()) ? value : parsed;
	}

	return value;
}, z.date().optional());

const aspectListSchema = z.preprocess(
	(value) =>
		Array.isArray(value)
			? value.filter(
					(item): item is (typeof aspectIds)[number] =>
						typeof item === "string" && validAspectIds.includes(item),
				)
			: [],
	z.array(aspectIdSchema),
);

const optionalAspectIdSchema = z.preprocess((value) => {
	if (value === null || value === undefined) return undefined;
	if (typeof value === "string" && value.trim() === "") return undefined;
	return value;
}, aspectIdSchema.optional());

function normalizeAspectWeightsObject(value: unknown) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}

	const normalized: Record<string, number> = {};
	for (const [aspect, weight] of Object.entries(
		value as Record<string, unknown>,
	)) {
		if (!validAspectIds.includes(aspect)) continue;
		if (weight === null || weight === undefined || weight === "") continue;

		const numericWeight = typeof weight === "number" ? weight : Number(weight);
		if (Number.isFinite(numericWeight) && numericWeight > 0) {
			normalized[aspect] = numericWeight;
		}
	}

	return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeAspectWeightsInput(value: unknown) {
	if (Array.isArray(value)) {
		for (const item of value) {
			const normalized = normalizeAspectWeightsObject(item);
			if (normalized) return normalized;
		}
		return undefined;
	}

	return normalizeAspectWeightsObject(value);
}

const createAspectWeightsSchema = (fieldName: string) =>
	z
		.preprocess(
			(value) => normalizeAspectWeightsInput(value),
			z.record(z.string(), z.number().positive()).optional(),
		)
		.refine(
			(weights) =>
				!weights ||
				Object.keys(weights).every((aspect) => validAspectIds.includes(aspect)),
			`${fieldName} 只能使用已定义的准则 id`,
		);

const aspectWeightsSchema = createAspectWeightsSchema("aspectWeights");
const advancedAspectWeightsSchema = createAspectWeightsSchema(
	"advancedAspectWeights",
);

const postSchema = z
	.object({
		title: z.string(),
		published: dateValueSchema,
		updated: optionalDateValueSchema,
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		summary: z.string().optional().default(""),
		keywords: stringListSchema.optional().default([]),
		aspects: aspectListSchema.optional().default([]),
		primaryAspect: optionalAspectIdSchema,
		aspectWeights: aspectWeightsSchema,
		advancedAspectWeights: advancedAspectWeightsSchema,
		image: z.string().optional().default(""),
		tags: stringListSchema.optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		pinned: z.boolean().optional().default(false),
		author: z.string().optional().default(""),
		sourceLink: z.string().optional().default(""),
		licenseName: z.string().optional().default(""),
		licenseUrl: z.string().optional().default(""),
		comment: z.boolean().optional().default(true),
		password: z.string().optional().default(""),
		passwordHint: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	})
	.superRefine((post, context) => {
		const hasSecretHistories =
			post.primaryAspect === "secretHistories" ||
			post.aspects.includes("secretHistories") ||
			(post.aspectWeights?.secretHistories ?? 0) > 0 ||
			(post.advancedAspectWeights?.secretHistories ?? 0) > 0;
		const encrypted = post.password.trim().length > 0;

		if (encrypted && !hasSecretHistories) {
			context.addIssue({
				code: "custom",
				path: ["aspects"],
				message: "加密文章必须包含隐藏准则“秘史”",
			});
		}
		if (!encrypted && hasSecretHistories) {
			context.addIssue({
				code: "custom",
				path: ["aspects"],
				message: "隐藏准则“秘史”只能用于加密文章",
			});
		}
	});

const postsCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: postSchema,
});

const specCollection = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
	schema: z.object({}),
});

const dynamicCollection = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/dynamic" }),
	schema: z.object({
		published: z.date(),
	}),
});

export const collections = {
	dynamic: dynamicCollection,
	posts: postsCollection,
	spec: specCollection,
};
