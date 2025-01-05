import type { App } from "../server";
import config from "$lib/config";
import { treaty } from "@elysiajs/eden";

export const client = treaty<App>(config.apiUrl, {
    headers: () => {
        if (globalThis.window) {
            // const pubKey = globalThis.window.phantom?.publicKey?.toString();
            const pubKey = "";

            if (!pubKey || pubKey === null) {
                return {};
            };
            
            return {
                "x-public-key": pubKey,
            };
        };

        return {};
    },
});