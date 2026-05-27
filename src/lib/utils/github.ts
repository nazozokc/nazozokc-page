import { getCachedData, setCachedData } from './cache';

const CACHE_KEY_REPOS = 'github_repos';
const CACHE_KEY_EVENTS = 'github_events';

const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: '#3178c6',
	JavaScript: '#f1e05a',
	Python: '#3572A5',
	Rust: '#dea584',
	Go: '#00ADD8',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Shell: '#89e051',
	Nix: '#7e7eff',
	Lua: '#000080'
};

export function getLanguageColor(lang: string): string {
	return LANGUAGE_COLORS[lang] || '#858585';
}

export interface GitHubRepo {
	name: string;
	description: string | null;
	html_url: string;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	fork: boolean;
}

export async function fetchRepos(): Promise<GitHubRepo[]> {
	const cached = getCachedData<GitHubRepo[]>(CACHE_KEY_REPOS);
	if (cached) return cached;

	const res = await fetch('https://api.github.com/users/nazozokc/repos?sort=updated&per_page=20');
	if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? 'rate_limit' : 'network');
	const repos: GitHubRepo[] = await res.json();
	setCachedData(CACHE_KEY_REPOS, repos);
	return repos;
}

export interface ContributionStats {
	total: number;
	today: number;
}

export async function fetchContributionStats(): Promise<ContributionStats> {
	const cached = getCachedData<ContributionStats>(CACHE_KEY_EVENTS);
	if (cached) return cached;

	const allEvents: any[] = [];
	const baseUrl = 'https://api.github.com/users/nazozokc/events?per_page=100';
	for (let page = 1; page <= 3; page++) {
		const url = page === 1 ? baseUrl : `${baseUrl}&page=${page}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? 'rate_limit' : 'network');
		const data = await res.json();
		if (data.length === 0) break;
		allEvents.push(...data);
	}

	const now = new Date();
	const today = now.toDateString();
	const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
	let totalCount = 0, todayCount = 0;

	for (const event of allEvents) {
		if (event.type !== 'PushEvent') continue;
		const eventDate = new Date(event.created_at);
		if (eventDate < ninetyDaysAgo) continue;
		totalCount += event.payload.commits?.length || 0;
		if (eventDate.toDateString() === today) {
			todayCount += event.payload.commits?.length || 0;
		}
	}

	const stats: ContributionStats = { total: totalCount, today: todayCount };
	setCachedData(CACHE_KEY_EVENTS, stats);
	return stats;
}
