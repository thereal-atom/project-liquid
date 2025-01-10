<script lang="ts">
	import type { AmmRpcData, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
    
	import { getAppState } from "$lib/context/app.svelte";
	import { onMount } from "svelte";
	import { getRaydiumSwapQuote } from "$lib/utils/raydium";
	import { debounce } from "$lib/utils/common";
    
    const app = getAppState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        tokenBalances: Record<string, number>;
        uiAmountIn: number;
    };
    const { pool, poolRpcData, uiAmountIn }: Props = $props();

    onMount(() => { calculateSwapAmounts() });

    let isLoadingSwapQuote = $state(false);

    let swapAmountA = $state(0);
    let swapAmountB = $state(0);

    const calculateSwapAmounts = () => {
        debounce(() => {
            if (!app.raydiumClient) return;

            const quote = getRaydiumSwapQuote(app.raydiumClient, {
                poolInfo: pool,
                poolRpcData: poolRpcData,
                uiAmountIn: uiAmountIn,
            });
    
            swapAmountA = uiAmountIn;
            swapAmountB = quote.amountOut.toNumber() / 10 ** pool.mintB.decimals;
        }, 200);
    };

    const handleConfirmSwap = async () => {
        calculateSwapAmounts();

        console.log(swapAmountA, swapAmountB);
    };

    // todo: real invalid logic
    let isInvalid = $state(false);
    let isLoading = $state(false);
</script>

<div class="flex flex-col">
    <p class="font-semibold">Step 1: Swap</p>
    <!-- tooltip: you need to deposit sol and the the token into the liquidity pool. swap now to ensure you have enough. -->
    <div class="flex flex-col mt-4">
        {#if isLoadingSwapQuote}
            <p class="my-4 font-semibold">Loading swap quote...</p>
        {:else}
            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{swapAmountA}</p>
                    <div class="flex flex-row items-center">
                        <p class="font-semibold">{pool.mintA.symbol}</p>
                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                            <img
                                class="w-6 min-w-6 h-6 rounded-full"
                                src={pool.mintA.logoURI}
                                alt={pool.mintA.symbol}
                            />
                        </div>
                    </div>
                </div>
                <img src="/icons/down-arrow.svg" alt="down-arrow" class="w-6 h-6 my-4" />
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{swapAmountB}</p>
                    <div class="flex flex-row items-center">
                        <p class="font-semibold">{pool.mintB.symbol}</p>
                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                            <img
                                class="w-6 min-w-6 h-6 rounded-full"
                                src={pool.mintB.logoURI}
                                alt={pool.mintB.symbol}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <button
                class="mt-4 py-3 bg-accent text-sm font-semibold rounded-md"
                disabled={isInvalid}
                onclick={handleConfirmSwap}
            >
                Confirm Swap
            </button>
        {/if}
        <button
            class="mt-4 py-3 bg-primary text-sm font-semibold rounded-md border border-secondary/10"
            disabled={isLoading}
        >
            Skip Swap
        </button>
    </div>
</div>