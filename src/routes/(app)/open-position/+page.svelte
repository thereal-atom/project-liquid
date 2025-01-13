<script lang="ts">
	import { page } from "$app/stores";

    import { WSOLMint, type AmmRpcData, type AmmV4Keys, type AmmV5Keys, type ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

    import OpenPositionPanel from "$lib/features/position/open/components/OpenPositionPanel.svelte";
	import PoolInfoPanel from "$lib/features/pool/PoolInfoPanel.svelte";

    import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";	

    import { getRaydiumPoolInfo, getRaydiumPoolInfoFromRpc } from "$lib/utils/raydium";
	import { getAccountBalance, getTokenAccountAmountByOwner } from "$lib/utils/solana";

    const app = getAppState();
    const wallet = getWalletState();
    
    let pool: ApiV3PoolInfoStandardItem | undefined = $state(undefined);
    let poolRpcData: AmmRpcData | undefined = $state(undefined);
    let poolKeys: AmmV4Keys | AmmV5Keys | undefined = $state(undefined);

    let tokenBalances: Record<string, any> = $state({});

    // todo: fix weird bug
    // on very first page load (first time this pool is loaded? first time app comes online? not sure.) pool never loads
    // works fine on page refresh

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
        // runs only when pool is loaded
        if (pool) return;

        // ! rpc call (once)
        getRaydiumPoolInfo(app.raydiumClient, $page.url.searchParams.get("poolId") || "").then(poolInfo => {
            pool = poolInfo as ApiV3PoolInfoStandardItem;
            updateBalances();
        });
    };

    const updatePoolData = () => {
        if (!app.raydiumClient || !pool) return;

        // ! rpc call (every 30 seconds)
        getRaydiumPoolInfoFromRpc(app.raydiumClient, pool.id).then((_pool) => {
            if (!pool) return;

            // todo: caching
            // not too bothered about this for now
            // biggest issue is users spam refreshing in some way, so local cache should be fine
            // no need for global cache I don't think - unlikely many people will be trying to access the same token at the same time so much that I need cache

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
    <div class="p-8">
        <div class="flex flex-row justify-center">
            <OpenPositionPanel
                {pool}
                {poolRpcData}
                {poolKeys}
                {tokenBalances}
            />
            <div class="ml-5">
                <PoolInfoPanel {pool} />
            </div>
        </div>
    </div>
{:else}
    <p>Loading Pool.</p>
{/if}