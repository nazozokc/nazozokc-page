<script lang="ts">
	import { onMount } from 'svelte';
	import AnimateOnView from '$lib/components/AnimateOnView.svelte';

	interface ZennArticle {
		slug: string;
		title: string;
		emoji: string;
		published_at: string;
		article_type: string;
	}

	let articles = $state<ZennArticle[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const res = await fetch('https://zenn.dev/api/articles?username=nazozokc&order=latest');
			if (!res.ok) throw new Error('Failed to fetch Zenn articles');
			const data = await res.json();
			articles = data.articles || [];
		} catch (err) {
			error = 'Zenn記事の読み込みに失敗しました';
			console.error(err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Zenn — nazozokc</title>
</svelte:head>

<section class="hero-card">
	<div class="hero-content">
		<h1 class="hero-title">Zenn</h1>
		<p class="hero-subtitle">技術記事</p>
	</div>
</section>

<AnimateOnView>
	<section class="card-section">
		<h2 class="section-title">Articles</h2>
		{#if loading}
			<p class="loading">Loading <span class="loading-spinner"></span></p>
		{:else if error}
			<p class="error-msg">{error}</p>
		{:else if articles.length === 0}
			<p class="loading">No articles found</p>
		{:else}
			<div class="blog-grid">
				{#each articles as article}
					<a
						href="https://zenn.dev/nazozokc/articles/{article.slug}"
						target="_blank"
						rel="noopener noreferrer"
						class="blog-card"
					>
						<div class="blog-header">
							<span class="blog-emoji">{article.emoji || '📝'}</span>
							<span class="blog-date">
								{new Date(article.published_at).toLocaleDateString('ja-JP')}
							</span>
						</div>
						<h3 class="blog-title">{article.title}</h3>
						{#if article.article_type}
							<span class="blog-category">{article.article_type}</span>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</section>
</AnimateOnView>
