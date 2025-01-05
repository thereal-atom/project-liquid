<script>
    export let data;

    const {
        positions,
        marketData,
    } = data;
</script>

<div class="p-12">
    <h1 class="text-3xl font-bold">Portfolio</h1>
    <div class="flex flex-row w-full mt-12">
        <div class="flex flex-col w-full p-6 bg-primary border border-secondary/20 rounded-md">
            <h2 class="text font-medium opacity-60 text-secondary">Total Value</h2>
            <p class="mt-2 text-xl font-semibold">${(181.54).toFixed(2)}</p>
        </div>
        <div class="flex flex-col w-full ml-8 p-6 bg-primary border border-secondary/20 rounded-md">
            <h2 class="text font-medium opacity-60 text-secondary">Total Profit and Loss</h2>
            <p class="mt-2 text-xl text-green-400 font-semibold">${(0).toFixed(2)}</p>
        </div>
    </div>
    <div class="flex flex-col mt-8">
        {#each positions as position}
            {@const assetsQuote = marketData.assets[position.liquidityPosition.poolId].quote[0]}
            {@const lpPoolQuote = marketData.lpPools[position.liquidityPosition.poolId]}
            {@const poolOwnedProportion = position.liquidityPosition.lpMint.amount / lpPoolQuote.lpAmount}
            {@const pooledMintA = poolOwnedProportion * lpPoolQuote.mintAmountA}
            {@const pooledMintB = poolOwnedProportion * lpPoolQuote.mintAmountB}
            {@const priceMintA = assetsQuote.price / assetsQuote.price_by_quote_asset}
            {@const priceMintB = assetsQuote.price}
            {@const poolPositionPnl = lpPoolQuote.lpPrice * position.liquidityPosition.lpMint.amount - position.liquidityPosition.lpMint.entryPrice * position.liquidityPosition.lpMint.amount}
            {@const shortsPnl = position.shortPosition ? ((position.shortPosition.mintA.amount * (position.shortPosition.mintA.entryPrice - priceMintA) + position.shortPosition.mintB.amount * (position.shortPosition.mintB.entryPrice - priceMintB)) * -1) : 0}
            {@const k = position.liquidityPosition.mintA.entryAmount * position.liquidityPosition.mintB.entryAmount}
            {@const priceRatio = (priceMintA / position.liquidityPosition.mintA.entryPrice) / (priceMintB / position.liquidityPosition.mintB.entryPrice)}
            {@const amountANoSwaps = position.liquidityPosition.mintA.entryAmount / Math.sqrt(priceRatio)}
            {@const amountBNoSwaps = k / amountANoSwaps}
            <div class="flex flex-col mb-8 p-10 pr-12 bg-primary border border-secondary/20 rounded-md">
                <div class="flex flex-row items-center">
                    <div class="flex flex-row">
                        <img
                            class="w-8 h-8 rounded-full"
                            src={position.liquidityPosition.mintA.logoUrl}
                            alt={position.liquidityPosition.mintA.symbol}
                        />
                        <img
                            class="w-8 h-8 rounded-full"
                            src={position.liquidityPosition.mintB.logoUrl}
                            alt={position.liquidityPosition.mintB.symbol}
                        />
                    </div>
                    <h2 class="ml-2 text-xl font-semibold">{position.name}</h2>
                </div>
                <div class="flex flex-col mt-10">
                    <div class="flex flex-row justify-between">
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Position Value</p>
                            <p class="mt-2 text-xl font-semibold">${(pooledMintA * priceMintA + pooledMintB * priceMintB).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Net PNL</p>
                            <p class="mt-2 text-xl text-{(poolPositionPnl + 0 + shortsPnl) >= 0 ? "green" : "red"}-400 font-semibold">${(poolPositionPnl + 0 + shortsPnl).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Position PNL</p>
                            <p class="mt-2 text-xl text-{poolPositionPnl >= 0 ? "green" : "red"}-400 font-semibold">${poolPositionPnl.toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Shorts PNL</p>
                            <p class="mt-2 text-xl text-{shortsPnl >= 0 ? "green" : "red"}-400 font-semibold">${shortsPnl.toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">24hr APR</p>
                            <p class="mt-2 text-xl font-semibold">{(lpPoolQuote.day.apr).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
                <!-- <div class="flex flex-col mt-4">
                    <h3 class="font-semibold">Pool Position</h3>
                    <div class="flex flex-row items-center mt-2 py-4 px-8 bg-white/5 rounded-md">
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">Original Investment</p>
                            <p class="mt-1 font-bold">${(position.liquidityPosition.mintA.entryAmount * position.liquidityPosition.mintA.entryPrice + position.liquidityPosition.mintB.entryAmount * position.liquidityPosition.mintB.entryPrice).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">Position Value</p>
                            <p class="mt-1 font-bold">${(pooledMintA * priceMintA + pooledMintB * priceMintB).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">Position Value If HODL</p>
                            <p class="mt-1 font-bold">${(position.liquidityPosition.mintA.entryAmount * priceMintA + position.liquidityPosition.mintB.entryAmount * priceMintB).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">Impermanent PNL</p>
                            <p class="mt-1 font-bold text-green-400">${((pooledMintA * priceMintA + pooledMintB * priceMintB) - (position.liquidityPosition.mintA.entryAmount * priceMintA + position.liquidityPosition.mintB.entryAmount * priceMintB)).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col w-[300px] ml-8 p-4 bg-black rounded-md">
                            <div class="flex flex-row items-center justify-between">
                                <p class="text-xs">Pooled {position.liquidityPosition.mintA.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-sm font-semibold">{pooledMintA.toFixed(5)} (${(pooledMintA * priceMintA).toFixed(2)})</p>
                                    <img
                                        class="ml-1 w-5 h-5 rounded-full border border-white"
                                        src={position.liquidityPosition.mintA.logoUrl}
                                        alt={position.liquidityPosition.mintA.symbol}
                                    />
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between mt-2">
                                <p class="text-xs">Pooled {position.liquidityPosition.mintB.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-sm font-semibold">{pooledMintB.toFixed(2)} (${(pooledMintB * priceMintB).toFixed(2)})</p>
                                    <img
                                        class="ml-1 w-5 h-5 rounded-full border border-white"
                                        src={position.liquidityPosition.mintB.logoUrl}
                                        alt={position.liquidityPosition.mintB.symbol}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col mt-4">
                    <h3 class="font-semibold">Liquidity Pool <span class="text-xs">({position.liquidityPosition.poolId})</span></h3>
                    <div class="flex flex-row items-center mt-2 py-4 px-8 bg-white/5 rounded-md">
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">TVL</p>
                            <p class="mt-1 font-bold">${(lpPoolQuote.tvl).toLocaleString()}</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">APR</p>
                            <p class="mt-1 font-bold">{(lpPoolQuote.day.apr).toFixed(2)}%</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">Pool Price</p>
                            <p class="mt-1 font-bold">${lpPoolQuote.lpPrice.toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-8">
                            <p class="text-sm font-medium">Pool Amount</p>
                            <p class="mt-1 font-bold">{position.liquidityPosition.lpMint.amount.toFixed(5)} / {lpPoolQuote.lpAmount.toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col w-[450px] ml-8 p-4 bg-black rounded-md">
                            <div class="flex flex-row items-center justify-between">
                                <p class="text-xs">Total Pooled {position.liquidityPosition.mintA.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-sm font-semibold">{lpPoolQuote.mintAmountA.toFixed(4)} (${(lpPoolQuote.mintAmountA * priceMintA).toLocaleString()})</p>
                                    <img
                                        class="ml-1 w-5 h-5 rounded-full border border-white"
                                        src={position.liquidityPosition.mintA.logoUrl}
                                        alt={position.liquidityPosition.mintA.symbol}
                                    />
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between mt-2">
                                <p class="text-xs">Pooled {position.liquidityPosition.mintB.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-sm font-semibold">{lpPoolQuote.mintAmountB.toFixed(4)} (${(lpPoolQuote.mintAmountB * priceMintB).toLocaleString()})</p>
                                    <img
                                        class="ml-1 w-5 h-5 rounded-full border border-white"
                                        src={position.liquidityPosition.mintB.logoUrl}
                                        alt={position.liquidityPosition.mintB.symbol}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->
                <!-- {#if position.shortPosition}
                    <div class="flex flex-col mt-4">
                        <h3 class="font-semibold">Short Positions</h3>
                        <div class="flex flex-row items-center mt-2 p-4 bg-white/5 rounded-md">
                            <table class="shorts-table w-full text-left rtl:text-right">
                                <thead class="text-xs">
                                    <tr>
                                        <th>Token</th>
                                        <th>Amount</th>
                                        <th>Entry Price</th>
                                        <th>Mark Price</th>
                                        <th>Value</th>
                                        <th>PNL</th>
                                    </tr>
                                </thead>
                                <tbody class="text-xs">
                                    <tr>
                                        <td>{position.shortPosition.mintA.baseAsset}</td>
                                        <td>{position.shortPosition.mintA.amount} {position.shortPosition.mintA.baseAsset}</td>
                                        <td>${position.shortPosition.mintA.entryPrice}</td>
                                        <td>${priceMintA.toFixed(2)}</td>
                                        <td>${(position.shortPosition.mintA.amount * priceMintA).toFixed(2)}</td>
                                        <td class="text-{(position.shortPosition.mintA.amount * (position.shortPosition.mintA.entryPrice - priceMintA) * -1) >= 0 ? "green" : "red"}-400">${(position.shortPosition.mintA.amount * (position.shortPosition.mintA.entryPrice - priceMintA) * -1).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>{position.shortPosition.mintB.baseAsset}</td>
                                        <td>{position.shortPosition.mintB.amount} {position.shortPosition.mintB.baseAsset}</td>
                                        <td>${position.shortPosition.mintB.entryPrice}</td>
                                        <td>${priceMintB.toFixed(5)}</td>
                                        <td>${(position.shortPosition.mintB.amount * priceMintB).toFixed(2)}</td>
                                        <td class="text-{(position.shortPosition.mintB.amount * (position.shortPosition.mintB.entryPrice - priceMintB) * -1) >= 0 ? "green" : "red"}-400">${(position.shortPosition.mintB.amount * (position.shortPosition.mintB.entryPrice - priceMintB) * -1).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>${(position.shortPosition.mintA.amount * priceMintA + position.shortPosition.mintB.amount * priceMintB).toFixed(2)}</td>
                                        <td class="text-{shortsPnl >= 0 ? "green" : "red"}-400">${shortsPnl.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/if} -->
                <!-- <div class="flex flex-col mt-4">
                    <h3 class="font-semibold">Profit Calculations</h3>
                    <div class="flex flex-row items-center mt-2 p-8 bg-white/5 rounded-md">
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">Original Amounts</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">{position.liquidityPosition.mintA.entryAmount} @ ${position.liquidityPosition.mintA.entryPrice} {position.liquidityPosition.mintA.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">{position.liquidityPosition.mintB.entryAmount} @ ${position.liquidityPosition.mintB.entryPrice} {position.liquidityPosition.mintB.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">k: {position.liquidityPosition.mintB.entryAmount * position.liquidityPosition.mintA.entryAmount}</p>
                            </div>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Current Amounts</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">{pooledMintA} @ ${priceMintA} {position.liquidityPosition.mintA.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">{pooledMintB} @ ${priceMintB} {position.liquidityPosition.mintB.symbol}</p>
                            </div>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Ratios</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">k: {k}</p>
                                <p class="mt-1 text-xs font-semibold">price ratio: {priceRatio}</p>
                            </div>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Amounts if no swaps</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">{amountANoSwaps} {position.liquidityPosition.mintA.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">{amountBNoSwaps} {position.liquidityPosition.mintB.symbol}</p>
                            </div>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Difference</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">{pooledMintA - amountANoSwaps} {position.liquidityPosition.mintA.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">{pooledMintB - amountBNoSwaps} {position.liquidityPosition.mintB.symbol}</p>
                            </div>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Values</p>
                            <div class="flex flex-col mt-2">
                                <p class="text-xs font-semibold">${(pooledMintA - amountANoSwaps) * priceMintA} from {position.liquidityPosition.mintA.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">${(pooledMintB - amountBNoSwaps) * priceMintB} from {position.liquidityPosition.mintB.symbol}</p>
                                <p class="mt-1 text-xs font-semibold">${(pooledMintB - amountBNoSwaps) * priceMintB + (pooledMintA - amountANoSwaps) * priceMintA} Total</p>
                            </div>
                        </div>
                    </div>
                </div> -->
                <!-- <div class="flex flex-col mt-4">
                    <h3 class="font-semibold">Maths</h3>
                    <div class="flex flex-row items-center mt-2 p-4 bg-white/5 rounded-md">
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">Current Value of Holdings (V_now)</p>
                            <p class="mt-1 font-bold">${(pooledMintA * priceMintA + pooledMintB * priceMintB).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Initial Value of Holdings  (V_initial)</p>
                            <p class="mt-1 font-bold">${(position.liquidityPosition.mintA.entryAmount * position.liquidityPosition.mintA.entryPrice + position.liquidityPosition.mintB.entryAmount * position.liquidityPosition.mintB.entryPrice).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Value If HODL (V_hodl)</p>
                            <p class="mt-1 font-bold">${(position.liquidityPosition.mintA.entryAmount * priceMintA + position.liquidityPosition.mintB.entryAmount * priceMintB).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col ml-16">
                            <p class="text-sm font-medium">Impermanent Loss (IL = V_hodl - V_now(without fees))</p>
                            <p class="mt-1 font-bold">${((position.liquidityPosition.mintA.entryAmount * priceMintA + position.liquidityPosition.mintB.entryAmount * priceMintB) - (pooledMintA * priceMintA + pooledMintB * priceMintB)).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">Providing Liquidity Profit (P_total = V_now - V_initial)</p>
                            <p class="mt-1 font-bold">${((pooledMintA * priceMintA + pooledMintB * priceMintB) - (position.liquidityPosition.mintA.entryAmount * position.liquidityPosition.mintA.entryPrice + position.liquidityPosition.mintB.entryAmount * position.liquidityPosition.mintB.entryPrice)).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-sm font-medium">Trading Fess Profit (P_fees = P_total + IL)</p>
                            <p class="mt-1 font-bold">${(
                                ((pooledMintA * priceMintA + pooledMintB * priceMintB) - (position.liquidityPosition.mintA.entryAmount * position.liquidityPosition.mintA.entryPrice + position.liquidityPosition.mintB.entryAmount * position.liquidityPosition.mintB.entryPrice))
                                -
                                ((position.liquidityPosition.mintA.entryAmount * priceMintA + position.liquidityPosition.mintB.entryAmount * priceMintB) - (pooledMintA * priceMintA + pooledMintB * priceMintB))).toFixed(2)}</p>
                        </div>
                    </div>
                </div> -->
            </div>
        {/each}
    </div>
</div>

<style lang="postcss">
    .shorts-table td, th {
        @apply px-2 py-1;
    }
</style>