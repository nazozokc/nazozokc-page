<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} — nazozokc</title>
	<meta name="description" content={data.meta.category || data.meta.title} />
</svelte:head>

<div class="post-container">
	<div class="post-card">
		<a href="/blog" class="back-link">← 一覧に戻る</a>
		<article class="post-content">
			<header class="post-header">
				<div class="post-meta">
					{#if data.meta.emoji}
						<span class="post-emoji">{data.meta.emoji}</span>
					{/if}
					{#if data.meta.date}
						<span class="post-date">{data.meta.date}</span>
					{/if}
					{#if data.meta.category}
						<span class="post-category">{data.meta.category}</span>
					{/if}
				</div>
				<h1 class="post-title">{data.meta.title}</h1>
			</header>
			<div class="markdown-body">
				{@html data.html}
			</div>
		</article>
	</div>
</div>
