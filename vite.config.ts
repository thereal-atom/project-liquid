import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [
        sveltekit(),
        nodePolyfills({
            globals: {
                Buffer: true,
            },
            include: [ "crypto" ],
        }),
    ],
    resolve: {
        alias: {
            crypto: "crypto-browserify",
            stream: "stream-browserify",
        },
    },
    build: {
        rollupOptions: {
            plugins: [
                nodePolyfills({ include: [ "http", "buffer", "crypto" ] }),
            ],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
});