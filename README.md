# reonic takehome

## task 1

as the script (located at `src/routes/api/simulation`) is embedded into the second task which uses sveltekit and imports the data via its loaders its best to start the server and directly access the endpoint.

This can be done by running the following commands:

```bash
npm i && npm run serve # starts the server
curl -H 'Content-Type: application/json' \
     -d '{}' \
     -X POST \
    http://localhost:4173/api/simulation
```

via `-d` different paramters can be passed to the server. Accepted values (json-foramtted) are:

- charge_points: number
- charge_point_power_kw: number
- total_steps: number
- simulation_duration_seconds: number
- vehicle_efficiency_kwh_per_100km: number
- car_parks_atleast_1_step: boolean
- random_seed: string

obviously the max power demand directly relates (with a foctor of 11kw) to the number of used charge points, which are around 7 using the default values, therefor having less than 7 charge points will result in a concurrency of 1 (with some cars needing to leave without charging, or using a non charging space) and having more than 7 will linearly decrease the concurrency.

## task 2 (a)

