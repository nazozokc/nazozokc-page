import type { PageServerLoad } from './$types';
import { getBlogSlugs, getBlogPost } from '$lib/utils/blog';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const slugs = await getBlogSlugs();
	const posts = slugs
		.map((slug: string) => getBlogPost(slug))
		.filter((p): p is NonNullable<typeof p> => p !== null)
		.map(p => p.meta);

	return { posts };
};
