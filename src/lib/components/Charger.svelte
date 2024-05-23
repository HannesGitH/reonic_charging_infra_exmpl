<script context="module" lang="ts">
	export type ChargerData = {
		kw: number;
		is_selected: boolean;
	};
</script>

<script lang="ts">
	import GHCard from '$lib/components/GHCard.svelte';
	let { charger }: { charger: ChargerData } = $props();
</script>

<button onclick={() => (charger.is_selected = !charger.is_selected)}>
	<GHCard {content} is_selected={charger.is_selected} />
</button>

{#snippet content()}
	<i class="fa fa-solid fa-bolt" style="--kw: {charger.kw}"></i>
	<p class:accent={charger.is_selected}><strong>{charger.kw}</strong>kW</p>
{/snippet}

<style>
	button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		margin: 0;
		color: inherit;
	}
	.fa-bolt {
		color: rgb(241, 241, 164);
		transform: translateZ(2px);
		font-size: calc(1rem + var(--kw) * 0.2px);
		padding: calc(1rem - var(--kw) * 0.1px);
	}
	p {
		font-size: 0.8em;
		margin: 0;
		strong {
			font-size: 1.5em;
		}
		&.accent {
			color: var(--accent-color);
		}
	}
</style>
