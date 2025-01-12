<script lang="ts">
    import { onMount } from "svelte";

	import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
    
	import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getToasterState } from "$lib/context/toaster.svelte";
	
    import { getRaydiumSwapQuote, raydiumSwap } from "$lib/utils/raydium";
	import { getPhantomProvider } from "$lib/utils/phantom";
    
    const app = getAppState();
    const wallet = getWalletState();
    const toaster = getToasterState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        poolKeys: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
        uiAmountIn: number;
    };
    const { pool, poolRpcData, poolKeys, tokenBalances, uiAmountIn }: Props = $props();

    onMount(() => { calculateSwapAmounts() });
    
    $effect(() => {
        if (poolRpcData) {
            calculateSwapAmounts();
        };
    });

    let isLoadingSwapQuote = $state(false);

    let uiSwapAmountA = $state(0);
    let uiSwapAmountB = $state(0);

    const calculateSwapAmounts = () => {
        if (!app.raydiumClient) return;

        const quote = getRaydiumSwapQuote(app.raydiumClient, {
            poolInfo: pool,
            poolRpcData: poolRpcData,
            uiAmountIn: uiAmountIn,
        });

        uiSwapAmountA = uiAmountIn;
        uiSwapAmountB = quote.minAmountOut.toNumber() / 10 ** pool.mintB.decimals;
    };

    let isInsufficientMintA = $derived(uiSwapAmountA > (tokenBalances[pool.mintA.address] - 0.1));
    let isWalletConnected = $derived(wallet.pubKeyString !== null);

    let isLoading = $state(false);

    const handleConfirmSwap = async () => {
        // fetch recent rpc data? or is <30s age okay?
        calculateSwapAmounts();

        // fetch balances

        if (!isWalletConnected) {
            toaster.add({
                title: "Error Swapping (Wallet)",
                message: "Wallet not connected.",
                type: "error",
            });

            return;
        } else if (isInsufficientMintA) {
            toaster.add({
                title: "Error Swapping (Balance)",
                message: `Insufficient ${pool.mintA.symbol}.`,
                type: "error",
            });

            return;
        } else if (uiSwapAmountA > 100) {
            toaster.add({
                title: "Error Swapping (Amount)",
                message: `Amount is too high. Not allowed to swap more than 100 SOL at a time.`,
                type: "error",
            });

            return;
        };
        
        const provider = getPhantomProvider();

        if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

        isLoading = true;

        try {
            const { transaction } = await raydiumSwap(app.raydiumClient, {
                poolInfo: pool,
                poolKeys,
                uiAmountIn: uiSwapAmountA,
                uiAmountOut: uiSwapAmountB,
                mintInAddress: pool.mintA.address,
            });

            const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
            transaction.recentBlockhash = blockhash;

            const { signature } = await provider.signAndSendTransaction(transaction);

            // nothing after this runs until user confirms transaction
            // user confirming transaction DOESN'T mean the transaction is successful

            // todo: fetch transaction to check status
            console.log(signature);

            // todo: move to next step (tab)
                
            isLoading = false;
        } catch (err: any) {
            console.log(err);

            toaster.add({
                title: "Failed to swap.",
                message: err.message,
                type: "error",
            });

            isLoading = false;
        };
    };
</script>

<div class="flex flex-col">
    <p class="font-semibold">Step 1: Swap</p>
    <p class="mt-1 text-xs font-medium text-gray-500">In order to deposit liquidity into a pool, you need enough of each token. Swap now to ensure you have enough. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p>
    <div class="flex flex-col mt-4">
        {#if isLoadingSwapQuote}
            <p class="my-4 font-semibold">Loading swap quote...</p>
        {:else}
            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{uiSwapAmountA}</p>
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
                    <p class="font-bold">{uiSwapAmountB}</p>
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
                disabled={!isWalletConnected || isInsufficientMintA || isLoading}
                onclick={handleConfirmSwap}
            >
                {#if !isWalletConnected}
                    <p>Wallet Not Connected</p>
                {:else if isInsufficientMintA}
                    <p>Insufficient {pool.mintA.symbol}</p>
                {:else}
                    Confirm Swap
                {/if}
            </button>
        {/if}
        <div class="w-full mt-4">
            <p class="text-xs font-medium text-gray-500">You can skip this step if you already have enough of each token.</p>
            <!-- todo: move to next step (tab) -->
            <button
                class="w-full mt-1 py-3 bg-primary text-sm font-semibold rounded-md border border-secondary/10"
                disabled={isLoading}
            >
                Skip Swap
            </button>
        </div>
    </div>
</div>