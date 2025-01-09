<script lang="ts">
	import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
	
	import { page } from "$app/stores";
    import { getAppState } from "$lib/context/app.svelte";

    import { getRaydiumPoolInfo, getRaydiumPoolInfoFromRpc } from "$lib/utils/raydium";
	import OpenPositionPanel from "$lib/components/position/OpenPositionPanel.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getAccountBalance, getTokenAccountAmountByOwner } from "$lib/utils/solana";

    const app = getAppState();
    const wallet = getWalletState();
    
    let pool: ApiV3PoolInfoStandardItem | undefined = $state(undefined);
    let poolRpcData: AmmRpcData | undefined = $state(undefined);
    let poolKeys: AmmV4Keys | AmmV5Keys | undefined = $state(undefined);

    let tokenBalances: Record<string, any> = $state({});
    
    const updatePoolInfo = () => {
        console.log("attempting to update pool info");

        if (!app.raydiumClient) return;
        if (pool) return;

        console.log("updating pool info");

        getRaydiumPoolInfo(app.raydiumClient, $page.url.searchParams.get("poolId") || "").then(poolInfo => {
            pool = poolInfo as ApiV3PoolInfoStandardItem;
        });
    };

    const updatePoolData = () => {
        console.log("attempting to update pool data");

        if (!app.raydiumClient || !pool) return;

        console.log("updating pool data");

        // ! rpc call (every 30 seconds)
        // something like this would need to be in global cache (potentially server cache or just redis)
        // cache can be in memory since ttl is so short and doesn't need to be persisted
        // requires me to use the server to fetch this data rather than client
        // obviously have had issues with getting the data from server to client so make sure that is sorted
        getRaydiumPoolInfoFromRpc(app.raydiumClient, pool.id).then((_pool) => {
            if (!pool) return;

            pool.mintAmountA = _pool.poolInfo.mintAmountA;
            pool.mintAmountB = _pool.poolInfo.mintAmountB;

            poolRpcData = _pool.poolRpcData;
            poolKeys = _pool.poolKeys;
        });
    };

    $effect(() => {
        if (app.raydiumClient && app.connection) {
            updatePoolInfo();
            updatePoolData();

            // if (wallet.pubKeyString) {
            //     const cachedBalance = wallet.getTokenBalance("sol");
            //     if (!cachedBalance) {
            //         console.log(`fetching token account for sol as local data is old`);

            //         getAccountBalance(app.connection, wallet.pubKeyString).then(balance => {
            //             tokenBalances["sol"] = balance / 10 ** 9;
            //         });
            //     };

            //     if (pool) {
            //         const cachedMintBBalance = wallet.getTokenBalance(pool.mintB.address);
            //         if (!cachedMintBBalance) {
            //             console.log(`fetching token account for ${pool.mintB.address} as local data is old`);

            //             getTokenAccountAmountByOwner(app.connection, wallet.pubKeyString, pool.mintB.address).then(tokenAmount => {
            //                 if (!pool) return;

            //                 tokenBalances[pool.mintB.address] = tokenAmount?.uiAmount || 0;
            //             });
            //         };
            //     };
            // };

            const updatePoolDataInterval = setInterval(() => {
                updatePoolData();
            }, 20_000);

            return () => clearInterval(updatePoolDataInterval);
        };
    });
</script>

{#if pool}
    <OpenPositionPanel {pool} {tokenBalances}/>
{:else}
    <p>Loading Pool.</p>
{/if}