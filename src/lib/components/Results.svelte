<script context="module" lang="ts">
	export type ResultData = {
		actual_energy_usage_kwh: number;
		theoretical_max_power_kw: number;
		actual_max_power_kw: number;
		concurrency: number;
        charged_cars_counter : number,
        missed_cars_counter : number,
        missed_kwh_counter : number,
        charger_usage_distribution: number[];
	};
</script>

<script lang="ts">
	let { result }: { result: ResultData | null } = $props();
</script>

<div>
	{#if result}
		<div style="--concurrency: {result.concurrency * 100}">
			<h2 id="results-head">Simulation Results</h2>
            <p>Simulation period: 1 year</p>
			<div>
				<p id="concurrency">
					Concurrency: <strong>{(result.concurrency * 100).toFixed(0)}%</strong> of Theoretical Max Power
				</p>
                <p>
                    Actual Energy Usage: <strong>{result.actual_energy_usage_kwh.toFixed(0)} kWh</strong>
                </p>
                <p>
                    Actual Max Power: <strong>{result.actual_max_power_kw.toFixed(0)} kW</strong>
                </p>
                <p>
                    Charged Cars: <strong>{result.charged_cars_counter}</strong>
                </p>
                <p>
                    Missed Cars: <strong>{result.missed_cars_counter}</strong>, with a total of <strong>{result.missed_kwh_counter.toFixed(0)}kWh</strong> missed
                </p>
			</div>
            <div style="opacity: 0.6;">
                <h3>Charger Usage Distribution</h3>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    {#each result.charger_usage_distribution as usage, i}
                        <div class="barwrap">
                            <p>Charger {i + 1}</p>
                            <div style="background: linear-gradient(to right, white 0% {usage * 100}%, grey {usage * 100}% 100%); height: 1rem; width: 100%;border-radius: 1rem;"></div>
                        </div>
                    {/each}
                </div>
            </div>
		</div>
	{:else}
		<h2 id="results-head" class="loading">Loading...</h2>
	{/if}
</div>

<style>
	* {
		color: white;
	}

	/* #concurrency, */
	#results-head {
		width: fit-content;
		/* text-decoration: underline; */
		background: linear-gradient(
			to right,
			white 0% calc(var(--concurrency) * 1%),
			grey calc(var(--concurrency) * 1%) 100%
		);
		/* background-image: linear-gradient(to left, white 0% 20%, red 20% 100%); */
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

    .barwrap {
        display: flex; flex-direction: column; gap: 0.5rem;
        & > p {
            font-size: 0.8rem;
            margin: 0;
        }
    }

	h2#results-head {
		font-family: 'bebas neue', sans-serif;
		font-size: 2rem;
        margin-bottom: 0;
        padding-bottom: 0;
        & + p {
            font-weight: 200;
            font-size: smaller;
            margin-top: 0;
            padding-top: 0;
        }
	}

    h3 {
		font-family: 'bebas neue', sans-serif;
        font-size: 1.5rem;
        margin-top: 2rem;
    }

	.loading {
		opacity: 0.5;
	}
</style>
