import fs from 'node:fs';
import path from 'node:path';

export interface BlogPostMeta {
	slug: string;
	title: string;
	emoji: string;
	date: string;
	category: string;
}

export interface BlogPost {
	meta: BlogPostMeta;
	html: string;
}

function parseFrontmatter(markdown: string): Record<string, string> | null {
	const match = markdown.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;

	const fm: Record<string, string> = Object.create(null);
	const lines = match[1].split('\n');
	for (const line of lines) {
		const ci = line.indexOf(':');
		if (ci === -1) continue;
		const key = line.slice(0, ci).trim();
		let value = line.slice(ci + 1).trim();
		if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
		fm[key] = value;
	}
	return fm;
}

export async function getBlogSlugs(): Promise<string[]> {
	const manifestPath = path.resolve('static/blog-manifest.json');
	const raw = fs.readFileSync(manifestPath, 'utf-8');
	const manifest = JSON.parse(raw);
	return Array.isArray(manifest) ? manifest : manifest.posts || [];
}

export function getBlogPost(slug: string): BlogPost | null {
	const filePath = path.resolve('blog', `${slug}.md`);
	if (!fs.existsSync(filePath)) return null;

	const markdown = fs.readFileSync(filePath, 'utf-8');
	const fm = parseFrontmatter(markdown);
	if (!fm) return null;

	// Strip frontmatter and render markdown
	const body = markdown.replace(/^---[\s\S]*?---\n/, '');

	return {
		meta: {
			slug,
			title: fm.title || slug,
			emoji: fm.emoji || '📝',
			date: fm.date || '',
			category: fm.category || ''
		},
		html: body
	};
}

export function getAllBlogPosts(): BlogPost[] {
	const slugs = getBlogSlugs();
	const posts: BlogPost[] = [];
	for (const slug of slugs) {
		const post = getBlogPost(slug.toString());
		if (post) posts.push(post);
	}
	return posts;
}
