import { writable } from 'svelte/store';

export type Theme = 'day' | 'night';

function createThemeStore() {
	const initial = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
	const { subscribe, set, update } = writable<Theme>(initial ?? 'day');

	subscribe((value) => {
		if (typeof document === 'undefined') return;
		if (value === 'night') {
			document.documentElement.setAttribute('data-theme', 'night');
		} else {
			document.documentElement.removeAttribute('data-theme');
		}
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', value);
		}
	});

	return {
		subscribe,
		toggle: () => update((t) => (t === 'night' ? 'day' : 'night')),
		set
	};
}

export const theme = createThemeStore();
