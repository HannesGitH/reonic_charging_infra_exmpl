import { sveltekit } from '@sveltejs/kit/vite';
import dsv_parse from '@rollup/plugin-dsv';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		dsv_parse({})
	]
});
