import rand from "random-seed"; // js Math.random() is not deterministic (ie not seedable)

// this could theoretically be run client side as well but i consider the csv files as internal data, being in the server directory disallows import them in client facing code 
import t1 from "$lib/server/data/t1__hourly_arrival_distribution.csv";
import t2 from "$lib/server/data/t2__charging_demand_distribution.csv";

/// all parameters that can be tweaked by the user
export type SimulationData = {
    charge_points: number;
    charge_point_power_kw: number;
    total_steps: number;
    simulation_duration_seconds: number;
    vehicle_efficiency_kwh_per_100km: number;
    car_parks_atleast_1_step: boolean;
    random_seed?: string;
};

type T1Row = {'hour of day':string, 'arrival probability percentage': string};
type T2Row = {'charging demand in km':string, 'likelihood percentage': string};

type ChargingDemand = Array<{
    demand: number;
    demand_steps: number;
    likelihood: number;
    accumulated: number;
}>;

// generates a generator running the simulation of task 1
export async function mk_simulator(data:SimulationData){

    const prng = rand.create(data.random_seed);

    const steps_per_hour = _convert_to_steps_per_hour(data);

    // parsed t1 data, in this case provided via imported csv
    const arrival_probabilities_per_step = t1.map((row: T1Row) => +row["arrival probability percentage"]/100);// /steps_per_hour); //apparently the probabilities are already per step (not per hour in total)

    let _prob_accum = 0;
    // parsed t2 data, including an accumulated probability, used for random picking
    const charging_demand_distribution_accum = t2.map((row: T2Row) => {
        const likelihood = +row["likelihood percentage"]/100;
        const demand = +row["charging demand in km"]
        const demand_steps = demand / data.vehicle_efficiency_kwh_per_100km * steps_per_hour;
        _prob_accum += likelihood;
        return {demand, demand_steps, likelihood, accumulated: _prob_accum};
    }) as ChargingDemand;

    // uses the parsed t2 data to randomly pick a charging demand
    function sample_charging_demand(){
        const rnd = prng.random();
        const demand_row = charging_demand_distribution_accum.find((row) => rnd <= row.accumulated);
        return demand_row?.demand ?? 0; // float precision fix
    }

    // convenience variable with units converted for steps
    const charging_km_per_step = data.charge_point_power_kw / data.vehicle_efficiency_kwh_per_100km * 100 / steps_per_hour;

    type Slot = {
        remaining_charge_demand_km: number;
        available: boolean;
        current_power_draw_kw: number;
    }

    // the actual simulation
    function* stepwise_simulation(){
        // weird hack as js objects are always references, so filling directly would fill all slots with the same object, the map instantiates a new object for each slot
        let slots = new Array(data.charge_points).fill(0).map(() => ({remaining_charge_demand_km: 0, available: true, current_power_draw_kw: 0} as Slot));

        function cars_arriving(step: number){

            //!: i initially thought the arriving probabilities are given in total, but apparently they are per slot and per step, so we need to scale accordingly
            for (let i = 0; i < steps_per_hour; i++)
            if (prng.random() < arrival_probabilities_per_step[Math.floor(step/steps_per_hour)%24]){
                // find a free slot
                const slot = slots.find(s => s.available);
                if (slot){
                    const remaining_demand = sample_charging_demand();
                    slot.available = false;
                    slot.remaining_charge_demand_km = remaining_demand;
                    // this is the power draw, would allow extending the simulation for different charging speeds (per car, charger, battery-percentage) etc.
                    slot.current_power_draw_kw = remaining_demand > 0 ? (data.charge_point_power_kw) : 0;
                } else {
                    // no free slot, car leaves
                    // as this might be a bad event for the shop owner, this should be handled
                    console.warn("car leaves, no free slot");
                }
            };
        }

        function cars_leaving_and_charging(){
            for (let s of slots){
                if (!s.available){
                    if (s.remaining_charge_demand_km <= 0){
                        s.available = true;
                        s.current_power_draw_kw = 0;
                    }
                    s.remaining_charge_demand_km -= charging_km_per_step;
                }
            };
        }

        for (let step = 0; step < data.total_steps; step++){
            //FIXME: i didnt know what to do with the 34% of cars not needing any charge, as the text says they leave as soon as they are charged
            // so they either dont really arrive at all (could just scale the rest of the probabilities accordingly and remove that case)
            // or its meant that they stay for one step anyway
            if (data.car_parks_atleast_1_step){
                cars_leaving_and_charging();
                cars_arriving(step);
            } else {
                cars_arriving(step);
                cars_leaving_and_charging();
            }
            yield slots;
        }
    }

    return stepwise_simulation();
}

/// runs the simulation and calculates the requested values
export async function simulate(data:SimulationData){

    // only needed to convert between kilowatts * steps to kwh
    const steps_per_hour = _convert_to_steps_per_hour(data);
    const simulation = await mk_simulator(data);

    let actual_energy_usage_kwh = 0;
    let actual_max_power_kw = 0;
    for (const slots of simulation){
        const current_total_power_draw_kw = slots.reduce((acc, s) => acc + s.current_power_draw_kw, 0);
        if (current_total_power_draw_kw > actual_max_power_kw){
            actual_max_power_kw = current_total_power_draw_kw;
        }
        actual_energy_usage_kwh += current_total_power_draw_kw/steps_per_hour;
    }

    const theoretical_max_power_kw = data.charge_points * data.charge_point_power_kw;

    return {
        actual_energy_usage_kwh,
        theoretical_max_power_kw,
        actual_max_power_kw,
        concurrency: actual_max_power_kw / theoretical_max_power_kw
    }
}

// helper function to avoid repetition or making the SimulationData a class (this would be a memberfunction)
const _convert_to_steps_per_hour = (data:SimulationData) => data.total_steps / (data.simulation_duration_seconds / 3600);