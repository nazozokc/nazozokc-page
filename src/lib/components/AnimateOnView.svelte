<script lang="ts">
	let { children }: { children: import('svelte').Snippet } = $props();

	let element: HTMLElement;
	let isVisible = $state(false);

	$effect(() => {
		if (!element) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.unobserve(element);
					}
				}
			},
			{ threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={element}
	class="animate-in"
	class:visible={isVisible}
	style={isVisible ? '' : 'opacity:0;'}
>
	{@render children()}
</div>
