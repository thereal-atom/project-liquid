import type { PageServerLoad } from "./$types";
import type { ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
import { initRaydiumClient } from "$lib/utils/raydium";
import { initRpcConnection } from "$lib/utils/solana";

export const load = (async ({ url }) => {
    const poolId = url.searchParams.get("poolId");
    if (!poolId) {
        throw new Error("No pool id provided");
    };

    const defaultRaydiumClient = await initRaydiumClient({}, initRpcConnection("126f686a-fe11-4859-bcb5-5cd78dd4a33b"));

    // this pool data is mostly meta data as well as cached pool data (pooled amounts, tvl, etc)
    // therefore it can be cached (globally, on the server) for 1-3 minutes 
    // can be cached for quite a while (i.e. longer than the pooled data is cached, because it's already cached by raydium)
    // because on page load the rpc data is fetched (which is the most recent data)
    const pools = await defaultRaydiumClient.api.fetchPoolById({ ids: poolId });
    const pool = pools[0] as ApiV3PoolInfoStandardItem;

    const tokenPrices = {
        [pool.mintA.address]: 0,
        [pool.mintB.address]: 0,
    };

    return {
        pool,
        tokenPrices,
    };
}) satisfies PageServerLoad;