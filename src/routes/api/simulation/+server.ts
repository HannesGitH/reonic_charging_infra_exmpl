/// simple endpoint to run our simulation on the server for input given via the post body json

import { json } from "@sveltejs/kit";

import { simulate } from "./simulator.server";
import type { SimulationData } from "./simulator.server";

// given default simulation data
const defaultData: SimulationData = {
    charge_points: 20,
    charge_point_power_kw: 11,
    total_steps: 35040,
    simulation_duration_seconds: 3600*24*365,
    vehicle_efficiency_kwh_per_100km: 18,
    car_parks_atleast_1_step: true
};

export async function POST({ request, cookies }) {
    const data = {...defaultData, ...(await request.json())};

    // here we could run the simulation from task 1 given in any language we want by running a child process
    // but i keep it in ts st deployment stays straight forward
    const result = await simulate(data);

    return json(result);
}