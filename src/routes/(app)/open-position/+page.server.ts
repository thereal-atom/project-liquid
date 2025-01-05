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