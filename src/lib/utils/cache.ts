const CACHE_EXPIRY = 5 * 60 * 1000; // 5 min

export function getCachedData<T>(key: string): T | null {
	if (typeof localStorage === 'undefined') return null;
	const cached = localStorage.getItem(key);
	if (!cached) return null;
	try {
		const { data, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp < CACHE_EXPIRY) return data as T;
	} catch {
		// ignore
	}
	return null;
}

export function setCachedData<T>(key: string, data: T): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}
