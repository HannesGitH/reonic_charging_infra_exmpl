<script lang="ts">
	const initial_parking_spaces = 10;
	const initial_car_charge_speed_kw = 18;
	const max_parking_spaces = 200;
	const max_power_per_point_kw = 200;
	const default_point_power_kw = 11;
	const min_influx_mod_percentage = 20;
	const max_influx_mod_percentage = 200;

	import './style.css';
	import Charger from '../lib/components/Charger.svelte';
	import type { ChargerData } from '../lib/components/Charger.svelte';

	class Chargers {
		private _charger_amount = $state(initial_parking_spaces);
		private _charger_list = $state(
			new Array(max_parking_spaces).fill(0).map((_, i) => {
				return {
					kw: default_point_power_kw,
					is_selected: false,
					actual_index: i
				} as ChargerData;
			})
		);
		get amount() {
			return this._charger_amount;
		}
		set amount(newValue: number) {
			this._charger_amount = Math.min(Math.max(0, newValue), max_parking_spaces);
		}
		get list() {
			return this._charger_list.slice(0, this.amount);
		}
		get sorted() {
			return this.list.sort((a, b) => b.kw - a.kw);
		}
		get is_sorted() {
			return this.list == this.sorted; //should be fast enough for this small list and O(n) if list already sorted, for larger data something more performant would be needed
		}
		sort() {
			this._charger_list = this.sorted.concat(this._charger_list.slice(this.amount));
		}
		get selected() {
			return this.list.filter((charger) => charger.is_selected);
		}
		get selected_kw_total() {
			return this.selected.reduce((acc, charger) => acc + charger.kw, 0);
		}
		get kw_total() {
			return this.list.reduce((acc, charger) => acc + charger.kw, 0);
		}
		all_similar_kw(list: ChargerData[] = this.list) {
			if (list.length == 0) return false;
			return list.every((charger) => charger.kw == list[0].kw);
		}
		get selected_kw() {
			return this.all_similar_kw(this.selected) ? this.selected[0].kw : null;
		}
		set selected_kw(newValue: number | null) {
			if (newValue == null || newValue < 1 || newValue > max_power_per_point_kw) return;
			this.selected.forEach((charger) => (charger.kw = newValue!));
		}
		increase_selected() {
			this.selected.forEach((charger) => (charger.kw = Math.min(charger.kw + 1, max_power_per_point_kw)));
			console.log(this.selected)
		}
		decrease_selected() {
			this.selected.forEach((charger) => (charger.kw = Math.max(charger.kw - 1, 1)));
		}

		get there_are_selected() {
			return this.selected.length > 0;
		}
	}
	let chargers = new Chargers();

	let influx_mod_percentage = $state(100);
	let vehicle_efficiency_kwh_per_100km = $state(initial_car_charge_speed_kw);

	//XXX: we could also make a fetch button to only one the simulation on explicit user request if it were a large simulation
	// we also update on selection which is unnecessary
	$effect(() => {
		sim_result = null;
		fetch('/api/simulation', {
			method: 'POST',
			body: JSON.stringify({
				charge_points: chargers.amount,
				chargers: chargers.sorted, //the simulation makes the car always take the next best slot, by using sorted we can simulate cars choosing the *fastest* available charger
				influx_mod_percentage,
				vehicle_efficiency_kwh_per_100km
			}),
		}).then(
			async (response) => {
				if (response.ok) {
					const data = await response.json();
					sim_result = data as ResultData;
				} else {
					// would noramlly throw, to be catched by some error handler..
					console.error(new Error('Failed to fetch'));
				}
			}
		);
	});
	let sim_result : ResultData | null = $state(null);

	import { blur, draw, fly, scale } from 'svelte/transition';
	import { untrack } from 'svelte';
	import Results, { type ResultData } from '$lib/components/Results.svelte';
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

<section id="head-and-chargepoint-settings">
	<div class="side-menu power-menu" class:hidden={!chargers.there_are_selected}>
		{#if chargers.selected_kw}
			Power: <input type="number" bind:value={chargers.selected_kw} /> kW
		{:else}
			Power
		{/if}
		<div class="pm" style="padding-left: .5rem;">
			<button class="plus" onclick={()=>chargers.increase_selected()}>+</button>
			<button class="minus" onclick={()=>chargers.decrease_selected()}>-</button
			>
		</div>
	</div>
	<div id="head">
		<h1>Charging Point Simulator</h1>
		<p>Simulate how many charge points your carpark actually needs</p>
	</div>
	<div class="row">
		{#each chargers.list as charger, i}
			<div in:scale={{ duration: 500 }}>
				<Charger {charger} />
			</div>
		{/each}
		<div id="chargercount">
			<input type="number" bind:value={chargers.amount} />
		</div>
		<div class="pm">
			<button class="plus" onclick={() => chargers.amount++}>+</button>
			<button class="minus" onclick={() => chargers.amount--}>-</button>
		</div>
		<div id="total-info">
			<div>
				Total: <strong>{chargers.kw_total}</strong>kW max
				{#if !chargers.all_similar_kw() && !chargers.there_are_selected && !chargers.is_sorted}
					<button id="sort" onclick={() => chargers.sort()}>sort</button>
				{/if}
				<p
					class:hidden={!chargers.there_are_selected}
					style="color: var(--accent-color); display: inline;"
				>
					(<strong>{chargers.selected_kw_total}</strong>kW selected)
				</p>
			</div>
		</div>
	</div>
</section>

<div id="second-row-container">
	<section id="car-settings">
		<h2>Car Settings</h2>
		<p>Set expected car influx and available charging speed</p>
		<div class="slidecontainer">
			<label for="influx-mod">Influx modifier: <strong>{influx_mod_percentage}%</strong></label>
			<input
				type="range"
				min={min_influx_mod_percentage}
				max={max_influx_mod_percentage}
				bind:value={influx_mod_percentage}
				class="slider"
				id="influx-mod"
			/>
		</div>
		<br />
		<div id="car-kw-container">
			<label for="car-kw">Vehicle efficiency:</label><br />
			<input type="number" id="car-kw" bind:value={vehicle_efficiency_kwh_per_100km} />kW/100km
		</div>
	</section>
	<section>
		<Results result={sim_result} />
	</section>
</div>

<style>
	:global {
		body {
			background-color: #0e1110;
			font-family: 'oswald', sans-serif;
			color: var(--main-color);
		}
	}
	section#head-and-chargepoint-settings {
		text-align: center;
		position: relative;
		margin-top: 10vh;

		#total-info {
			margin: 1rem;
			font-size: large;
			/* display: flex;
			flex-direction: column;
			gap: 0.3rem;
			& > * {
				padding: 0;
				margin: 0;
			} */
		}

		#sort {
			background-color: var(--main-color);
			border: none;
			border-radius: 3rem;
			padding: 0.3rem 0.8rem;
			cursor: pointer;
			transition: all 0.3s;
			&:hover {
				background-color: rgb(206, 233, 177, 0.5);
			}
		}

		.side-menu {
			text-align: right;
			font-size: 0.8rem;
			position: absolute;
			top: 3rem;
			right: 10%;
		}
		.power-menu {
			background-color: var(--accent-color);
			border-radius: 1rem;
			padding: 2px 1rem;
			display: flex;
			align-items: center;
			height: 2.5rem;
			color: black;
			transition: all 0.3s;
			opacity: 1;
			input {
				font-family: 'bebas neue', sans-serif;
				padding: 0.2rem;
				font-size: 1.5rem;
				background-color: transparent;
				color: black;
				border: none;
				text-align: right;
				width: 2rem;
				&:focus {
					outline: 1px dashed black;
					border-radius: 1rem;
				}
			}
		}
		.hidden {
			opacity: 0;
		}

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
			/* margin: 1rem; */
		}

		#chargercount {
			padding: 2rem 1rem;
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
		}

		.pm {
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
					background-color: rgb(108, 122, 93);
					color: var(--color);
				}
				&.minus {
					--color: rgb(246, 144, 144);
					&:hover {
						background-color: rgb(76, 44, 44);
					}
				}
			}
		}
	}

	#second-row-container {
		display: flex;
		margin: 5rem;
		gap: 2rem;
		& > section {
			flex: 1;
			margin: 1rem;
		}
	}

	input[type='number'] {
		font-family: 'bebas neue', sans-serif;
		padding: 0.2rem;
		font-size: 1.5rem;
		background-color: transparent;
		color: var(--main-color);
		border: none;
		text-align: right;
		width: 2rem;
		border-bottom: 1px dashed var(--main-color);
		&:focus {
			outline: 1px dashed var(--main-color);
			border-radius: 0.3rem;
		}
	}

	section#car-settings {
		h2 {
			font-size: 2rem;
			font-family: 'bebas neue', sans-serif;
			margin-bottom: 0;
		}
		p {
			margin-top: 0;
		}

		.slidecontainer > label {
			/* font-size: .8rem; */
			/* font-weight: lighter; */
		}

		.slider {
			-webkit-appearance: none;
			width: 100%;
			height: 0.7rem;
			background: var(--main-color);
			outline: none;
			opacity: 0.5;
			transition: opacity 0.2s;
			border-radius: 2rem;
			&:hover {
				opacity: 1;
			}
			&::-webkit-slider-thumb,
			&::-moz-range-thumb {
				-webkit-appearance: none;
				appearance: none;
				width: 1rem;
				height: 1rem;
				background: #000;
				cursor: pointer;
				border-radius: 50%;
				border: 2px solid var(--main-color);
				opacity: 1;
				/* &:hover {
					background: var(--accent-color);
				} */
			}
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
</style>
