<script lang="ts">
	import './style.css';
	import Charger from './Charger.svelte';

	let chargers = $state(0);
</script>

<svelte:head>
	<title>Reonic Charge</title>
	<meta name="description" content="Charging Point Simulator" />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@200..700&display=swap"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
		integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
		crossorigin="anonymous"
		referrerpolicy="no-referrer"
	/>
</svelte:head>

<section>
	<div id="head">
		<h1>Charging Point Simulator</h1>
		<p>Simulate how many charge points your carpark actually needs</p>
	</div>
	<div class="row">
		{#each { length: chargers } as _, i}
			<Charger />
		{/each}
		<div id="chargercount">
			<input type="number" bind:value={chargers} />
		</div>
		<div id="pm">
			<button class="plus" onclick={() => chargers++}>+</button>
			<button class="minus" onclick={() => chargers--}>-</button>
		</div>
	</div>
</section>

<style>
	:global {
		body {
			background-color: #0e1110;
			font-family: 'oswald', sans-serif;
			color: var(--main-color);
		}
	}
	section {
		text-align: center;
		margin-top: 20vh;
		#head {
			margin-bottom: 3rem;
		}
		h1 {
			font-size: 3rem;
			font-family: 'bebas neue', sans-serif;
			margin-bottom: 0;
		}
		p {
			margin-top: 0;
		}
		.row {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-wrap: wrap;
			margin: 1rem;
		}

		#chargercount {
			padding: 0 1rem;
			/* font-size: 3rem; */
			input {
				font-family: 'bebas neue', sans-serif;
				font-size: 3rem;
				background-color: transparent;
				color: var(--main-color);
				border: none;
				/* border-bottom: 1px solid var(--main-color); */
				text-align: right;
				width: 6rem;
				&:focus {
					outline: 1px dashed var(--main-color);
					border-radius: 1rem;
				}
			}
			/* Chrome, Safari, Edge, Opera */
			input::-webkit-outer-spin-button,
			input::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}

			/* Firefox */
			input[type='number'] {
				-moz-appearance: textfield;
			}
		}

		#pm {
			/* above each other */
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
			button {
				--color: var(--main-color);
				transition: all 0.3s;
				background-color: var(--color);
				height: 1.5rem;
				border: 1px solid var(--color);
				border-radius: 0.3rem;
				aspect-ratio: 1/1;
				cursor: pointer;
				&:hover {
					background-color: rgb(206, 233, 177, 0.5);
					color: var(--color);
				}
				&.minus {
					--color: rgb(246, 144, 144);
					&:hover {
						background-color: rgb(246, 144, 144, 0.5);
					}
				}
			}
		}
	}
</style>
