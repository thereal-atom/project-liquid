<script lang="ts">
	import { WSOLMint, type AmmRpcData, type AmmV4Keys, type AmmV5Keys, type ApiV3PoolInfoStandardItem, type Raydium } from "@raydium-io/raydium-sdk-v2";
	
	import { page } from "$app/stores";
    import { getAppState } from "$lib/context/app.svelte";

    import { getRaydiumPoolInfo, getRaydiumPoolInfoFromRpc } from "$lib/utils/raydium";
	import OpenPositionPanel from "$lib/features/position/open/OpenPositionPanel.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getAccountBalance, getTokenAccountAmountByOwner } from "$lib/utils/solana";

    const app = getAppState();
    const wallet = getWalletState();
    
    let pool: ApiV3PoolInfoStandardItem | undefined = $state(undefined);
    let poolRpcData: AmmRpcData | undefined = $state(undefined);
    let poolKeys: AmmV4Keys | AmmV5Keys | undefined = $state(undefined);

    let tokenBalances: Record<string, any> = $state({});

    const updateBalances = () => {
        if (!app.connection) return;

        if (wallet.pubKeyString) {
            const cachedBalance = wallet.getTokenBalance(WSOLMint.toBase58());
            if (!cachedBalance) {
                getAccountBalance(app.connection, wallet.pubKeyString).then(balance => {
                    const uiAmount = balance / 10 ** 9;

                    tokenBalances[WSOLMint.toBase58()] = uiAmount;
                    wallet.setTokenBalance(WSOLMint.toBase58(), uiAmount);
                });
            } else {
                tokenBalances[WSOLMint.toBase58()] = cachedBalance;
            };

            if (pool) {
                const cachedMintBBalance = wallet.getTokenBalance(pool.mintB.address);
                if (!cachedMintBBalance) {
                    getTokenAccountAmountByOwner(app.connection, wallet.pubKeyString, pool.mintB.address).then(tokenAmount => {
                        if (!pool) return;

                        const uiAmount = tokenAmount?.uiAmount || 0;

                        tokenBalances[pool.mintB.address] = uiAmount;
                        wallet.setTokenBalance(pool.mintB.address, uiAmount);
                    });
                } else {
                    tokenBalances[pool.mintB.address] = cachedMintBBalance;
                };
            };
        };
    };
    
    const updatePoolInfo = () => {
        if (!app.raydiumClient) return;
        if (pool) return;

        getRaydiumPoolInfo(app.raydiumClient, $page.url.searchParams.get("poolId") || "").then(poolInfo => {
            pool = poolInfo as ApiV3PoolInfoStandardItem;

            // balances can only update when pool is loaded
            updateBalances();
        });
    };

    const updatePoolData = () => {
        if (!app.raydiumClient || !pool) return;

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
            // pool info is metadata while pool data is market data

            // runs once (as it's static data)
            updatePoolInfo();
            
            // runs every 30 seconds (as it's market data)
            updatePoolData();
            const updatePoolDataInterval = setInterval(() => {
                updatePoolData();
            }, 30_000);

            return () => clearInterval(updatePoolDataInterval);
        };
    });
</script>

{#if pool}
    <OpenPositionPanel
        {pool}
        {poolRpcData}
        {tokenBalances}
    />
{:else}
    <p>Loading Pool.</p>
{/if}