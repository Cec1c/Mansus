import { getSortedPosts } from "@/utils/content-utils";

export async function GET() {
	const posts = await getSortedPosts();

	const allPostsData = posts
		.map((post) => ({
			id: post.id,
			title: post.data.title,
			description: post.data.description,
			published: post.data.published.getTime(),
			category: post.data.category || "",
			tags: post.data.tags,
			aspects: post.data.aspects.filter(
				(aspect) => aspect !== "secretHistories",
			),
			primaryAspect:
				post.data.primaryAspect === "secretHistories"
					? ""
					: post.data.primaryAspect || "",
			password: !!post.data.password,
		}))
		// 日历按纯日期排序，忽略置顶
		.sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}
