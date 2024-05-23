<script lang="ts">
	import { hover3dFactory } from '$lib/utils/hooks/hover3d';
	import type { Snippet } from 'svelte';
	let { content, is_selected }: { content: Snippet; is_selected: boolean } = $props();
</script>

<div class="glowing-card" class:selected={is_selected} use:hover3dFactory()>
	{@render content()}
</div>

<style>
	.glowing-card {
		border-radius: 1rem;
		border: 1px solid var(--main-color);
		padding: 1rem;
		margin: 1rem;
		box-shadow: 0 0 1.2rem -0.5rem var(--main-color);
		/* transition: all 0.3s; */
		&.selected {
			border: 2px solid var(--accent-color);
			margin: calc(1rem - 1px);
		}
		&:hover {
			box-shadow: 0 0 1.2rem 0rem var(--main-color);
		}
	}
</style>
