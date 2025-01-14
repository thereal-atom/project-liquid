import type { Connection } from "@solana/web3.js";
import { getContext, setContext } from "svelte";
import { Raydium, type RaydiumLoadParams } from "@raydium-io/raydium-sdk-v2";
import { initRpcConnection } from "$lib/utils/solana";
import { initOxClient, type OxClient, type OxClientConfig } from "$lib/utils/ox";

class AppState {
    connection?: Connection = $state(undefined);
    raydiumClient?: Raydium = $state(undefined);
    oxClient?: OxClient = $state(undefined);

    constructor(options: {
        connection: Connection;
    }) {
        this.connection = options.connection;
    };

    async initRaydiumClient(payload: RaydiumLoadParams) {
        const raydiumClient = await Raydium.load(payload);

        this.raydiumClient = raydiumClient;
    };

    async initOxClient(config: OxClientConfig) {
        const oxClient = initOxClient(config);

        this.oxClient = oxClient;
    };
};

const APP_KEY = Symbol("APP");

export const setAppState = () => {
    const connection = initRpcConnection("126f686a-fe11-4859-bcb5-5cd78dd4a33b");

    return setContext(APP_KEY, new AppState({ connection }));
};

export const getAppState = () => {
    return getContext<ReturnType<typeof setAppState>>(APP_KEY);
};