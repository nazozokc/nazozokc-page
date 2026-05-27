<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { theme } from '$lib/theme';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';



	// Restore theme on mount
	onMount(() => {
		const saved = localStorage.getItem('theme');
		if (saved === 'night') {
			theme.set('night');
		}
	});
</script>

<Header />

<main class="main-content">
	<div class="page-enter">
		<slot />
	</div>
	<Footer />
</main>
