<script>
    import oxFunMarkets from "$lib/data/markets/ox-fun-markets.json";
    import hyperliquidMarkets from "$lib/data/markets/hyperliquid-markets.json";

    let { data } = $props();

    const pools = data.pools
        .map(pool => {
            return {
                ...pool,
                isInOxFunMarket: oxFunMarkets.find(market => market.base === pool.mintA.symbol || market.base === pool.mintB.symbol),
                isInHyperliquidMarket: hyperliquidMarkets.find(market => market.name === pool.mintA.symbol || market.name === pool.mintB.symbol),
                memeMint: pool.mintA.symbol === "WSOL" ? pool.mintB : pool.mintA,
            };
        })
        .sort((a, b) => b.day.apr - a.day.apr)
        .filter(pool => pool.tvl > 10_000);

    let showOnlyRelevantPools = $state(true);
    let showOnlyGoodPools = $state(false);
    
    let relevantPools = $derived(showOnlyRelevantPools ? pools.filter(pool => (pool.isInOxFunMarket || pool.isInHyperliquidMarket) && pool.tvl > 100_000) : pools);
    let goodPools = $derived(showOnlyGoodPools ? relevantPools.filter(pool => pool.week.apr > 300 && pool.day.apr > 200) : relevantPools);

    let searchQuery = $state(null);
</script>

<div class="p-12">
    <h1 class="text-3xl font-bold">Liquidity Pools</h1>
    <div class="flex flex-col mt-8">
        <h2 class="text-xl font-medium">Filters</h2>
        <div class="flex flex-col">
            <label for="showOnlyRelevantPools" class="flex items-center">
                <input
                    type="checkbox"
                    id="showOnlyRelevantPools"
                    bind:checked={showOnlyRelevantPools}
                />
                <span class="ml-2">Show only relevant pools</span>
            </label>
            <label for="showOnlyGoodPools" class="flex items-center mt-2">
                <input
                    type="checkbox"
                    id="showOnlyGoodPools"
                    bind:checked={showOnlyGoodPools}
                />
                <span class="ml-2">Show only good pools</span>
            </label>
            <input
                class="bg-inherit mt-4 p-3 rounded-md border border-white"
                type="text"
                name="searchQuery"
                bind:value={searchQuery}
                placeholder="Search by name or ticker"
            />
        </div>
        <div class="flex flex-col mt-4">
            <table class="pools-table w-full text-left rtl:text-right border border-white/20">
                <thead class="text-xs bg-[#101010]">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Pair
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Liquidity
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Volume 7D
                        </th>
                        <th scope="col" class="px-6 py-3">
                            APR 7D (24H)
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Markets
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Links
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each searchQuery ? goodPools.filter(pool => pool.mintA.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || pool.mintB.symbol.toLowerCase().includes(searchQuery.toLowerCase())) : goodPools as pool}
                        <tr>
                            <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                <div class="flex flex-row items-center">
                                    <img
                                        class="w-6 h-auto rounded-full"
                                        src={pool.mintA.logoURI}
                                        alt={pool.mintA.symbol}
                                    />
                                    <span class="ml-1">{pool.mintA.symbol}</span>
                                </div>
                                <span>-</span>
                                <div class="flex flex-row items-center">
                                    <span>{pool.mintB.symbol}</span>
                                    <img
                                        class="w-6 h-auto ml-1 rounded-full"
                                        src={pool.mintB.logoURI}
                                        alt={pool.mintB.symbol}
                                    />
                                </div>
                            </th>
                            <td class="px-6 py-4">
                                ${Math.round(pool.tvl).toLocaleString()}
                            </td>
                            <td class="px-6 py-4">
                                ${Math.round(pool.day.volume).toLocaleString()}
                            </td>
                            <td class="px-6 py-4">
                                <p class="{pool.week.apr > 300 && pool.day.apr > 200 ? "text-green-400" : "text-white"}">
                                    <span>{pool.week.apr.toFixed(2)}%</span>
                                    <span>({pool.day.apr.toFixed(2)}%)</span>
                                </p>
                            </td>
                            <td class="px-6 py-4">
                                <p>
                                    {#if pool.isInOxFunMarket}
                                        <span class="font-bold">OX</span>
                                    {/if}
                                    {#if pool.isInHyperliquidMarket}
                                        <span class="font-bold">HL</span>
                                    {/if}
                                </p>
                            </td>
                            <td class="px-6 py-4">
                                <a
                                    class="px-4 py-2 font-medium text-sm text-purple-400 border border-purple-500 rounded-md"
                                    href="https://raydium.io/liquidity/increase/?mode=add&pool_id={pool.id}"
                                    target="_blank"
                                >
                                    Raydium
                                </a>
                                <a
                                    class="ml-2 px-4 py-2 font-medium text-sm text-blue-400 border border-blue-500 rounded-md"
                                    href="/open-position?poolId={pool.id}"
                                >
                                    Open Position
                                </a>
                                <a
                                    class="ml-2 px-4 py-2 font-medium text-sm text-gray-200 border border-gray-300 rounded-md"
                                    href="https://dexscreener.com/solana/{pool.memeMint.address}"
                                    target="_blank"
                                >
                                    DexScreener
                                </a>
                                {#if pool.isInOxFunMarket}
                                    <a
                                        class="ml-2 px-4 py-2 font-medium text-sm text-green-200 border border-green-300 rounded-md"
                                        href="https://ox.fun/en/markets/{pool.memeMint.symbol}-USD-SWAP-LIN"
                                        target="_blank"
                                    >
                                        OX
                                    </a>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style lang="postcss">
    .pools-table tbody tr {
        @apply border-b border-white/20;
    }

    .pools-table tbody tr:nth-child(even) {
        @apply bg-[#121212];
    }

    .pools-table tbody tr:last-child {
        @apply border-b-0;
    }
</style>