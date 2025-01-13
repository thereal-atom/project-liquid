<script lang="ts">
    import { onMount } from "svelte";
	import { slide } from "svelte/transition";

	import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
    
	import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getToasterState } from "$lib/context/toaster.svelte";
	
    import { getRaydiumSwapQuote, raydiumSwap } from "$lib/utils/raydium";
	import { getPhantomProvider } from "$lib/utils/phantom";
	import { getMintSymbol } from "$lib/utils/solana";
	import WalletConnectedButton from "$lib/components/WalletConnectedButton.svelte";
    
    const app = getAppState();
    const wallet = getWalletState();
    const toaster = getToasterState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        poolKeys: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
        uiAmountIn: number;
        onSkipSwap: () => void;
    };
    const { pool, poolRpcData, poolKeys, tokenBalances, uiAmountIn, onSkipSwap }: Props = $props();

    onMount(() => { calculateSwapAmounts() });
    
    $effect(() => {
        if (poolRpcData) {
            calculateSwapAmounts();
        };
    });

    let isQuoteMoreInfoShown = $state(false);

    let uiSwapAmountA = $state(0);
    let uiSwapAmountB = $state(0);
    let uiSwapMinAmountB = $state(0);
    let priceImpact = $state(0);

    const calculateSwapAmounts = () => {
        if (!app.raydiumClient) return;

        const quote = getRaydiumSwapQuote(app.raydiumClient, {
            poolInfo: pool,
            poolRpcData: poolRpcData,
            uiAmountIn: uiAmountIn,
        });

        uiSwapAmountA = uiAmountIn;
        uiSwapAmountB = quote.amountOut.toNumber() / 10 ** pool.mintB.decimals;
        uiSwapMinAmountB = quote.minAmountOut.toNumber() / 10 ** pool.mintB.decimals;
        priceImpact = quote.priceImpact.toNumber();
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
                message: `Insufficient ${getMintSymbol(pool.mintA)}.`,
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

        console.log(poolKeys);

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

            const txid = signature;

            let subscriptionId;
            // try {
            //     subscriptionId = app.connection.onSignature(txid, (updatedTxInfo) => {
            //         console.log("asdasdasdasdasd");
            //         // if (updatedTxInfo.err) {
            //         //     console.error("Transaction failed:", updatedTxInfo.err);
            //         // } else {
            //         //     console.log("Transaction confirmed ✅");
            //         // };
            //     }, "finalized");
            // } finally {
            //     if (subscriptionId) {
            //         app.connection.removeSignatureListener(subscriptionId);
            //     };
            // };

            toaster.add({
                title: "Success! Transaction confirmed.",
                message: `Swapped ${uiSwapAmountA} ${getMintSymbol(pool.mintA)} for ${uiSwapAmountB} ${getMintSymbol(pool.mintB)}.`,
                type: "success",
            });

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

<div class="flex flex-col justify-between h-full">
    <div class="flex flex-col">
        <div class="flex flex-row items-center">
            <img
                class="w-4 h-4"
                src="/icons/tooltip-i.svg"
                alt="tooltip"
            />
            <p class="ml-1 font-semibold">Step 1: Swap</p>
        </div>
        <!-- todo: this will be better in a tooltip -->
        <!-- <p class="mt-1 text-xs font-medium text-gray-500">In order to deposit liquidity into a pool, you need enough of each token. Swap now to ensure you have enough. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p> -->
        <div class="flex flex-col mt-4">
            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{uiSwapAmountA.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
                    <div class="flex flex-row items-center">
                        <p class="font-semibold">{getMintSymbol(pool.mintA)}</p>
                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                            <img
                                class="w-6 min-w-6 h-6 rounded-full"
                                src={pool.mintA.logoURI}
                                alt={getMintSymbol(pool.mintA)}
                            />
                        </div>
                    </div>
                </div>
                <img src="/icons/down-arrow.svg" alt="down-arrow" class="w-6 h-6 my-4" />
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{uiSwapAmountB.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
                    <div class="flex flex-row items-center">
                        <p class="font-semibold">{getMintSymbol(pool.mintB)}</p>
                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                            <img
                                class="w-6 min-w-6 h-6 rounded-full"
                                src={pool.mintB.logoURI}
                                alt={getMintSymbol(pool.mintB)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <!-- this is useful but makes for a very cluttered section -->
            <div class="flex flex-col mt-2 bg-primary/50 border border-secondary/10 rounded-md p-4">
                <p class="font-medium text-sm">1 {getMintSymbol(pool.mintA)} ≈ {(uiSwapAmountB / uiSwapAmountA).toLocaleString()} {getMintSymbol(pool.mintB)}</p>
                {#if isQuoteMoreInfoShown}
                    <div
                        class="flex flex-col"
                        transition:slide={{ duration: 200 }}
                    >
                        <div class="flex flex-row items-center justify-between w-full mt-2 text-xs">
                            <p class="opacity-60">Minimum Received</p>
                            <p class="font-medium text-xs"> {uiSwapMinAmountB} {getMintSymbol(pool.mintB)}</p>
                        </div>
                        <div class="flex flex-row items-center justify-between w-full mt-2 text-xs">
                            <p class="opacity-60">Price Impact</p>
                            <p class="font-medium text-xs">{priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%</p>
                        </div>
                        <div class="flex flex-row items-center justify-between w-full mt-2 text-xs">
                            <p class="opacity-60">Estimated Fees</p>
                            <!-- todo: better way to get fees? -->
                            <p class="font-medium text-xs">{0.0025 * uiAmountIn} SOL</p>
                        </div>
                    </div>
                {/if}
                <div class="flex flex-row justify-center w-full">
                    <button
                        class="flex flex-row items-center opacity-60 hover:cursor-pointer"
                        onclick={() => isQuoteMoreInfoShown = !isQuoteMoreInfoShown}
                    >
                        <p class="text-xs font-semibold">{isQuoteMoreInfoShown ? "Less Info" : "More Info"}</p>
                        {#if isQuoteMoreInfoShown}
                            <img
                                src="/icons/chevron-up.svg"
                                alt="chevron up"
                                class="w-4 h-4 ml-1"
                            />
                        {:else}
                            <img
                                src="/icons/chevron-down.svg"
                                alt="chevron down"
                                class="w-4 h-4 ml-1"
                            />
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="flex flex-col mt-4">
        <WalletConnectedButton
            className="standard-button mt-4"
            isDisabled={isLoading || isInsufficientMintA}
            disabledText={[
                isInsufficientMintA && `Insufficient ${getMintSymbol(pool.mintA)}`,
            ]}
            onClick={handleConfirmSwap}
        >
            Confirm Swap
        </WalletConnectedButton>
        <div class="w-full mt-2">
            <!-- todo: this is useful but makes for a very cluttered section. put it in a tooltip -->
            <!-- <p class="text-xs font-medium text-gray-500">You can skip this step if you already have enough of each token.</p> -->
            <button
                class="w-full py-3 bg-primary text-sm font-semibold rounded-md border border-secondary/10"
                disabled={isLoading}
                onclick={onSkipSwap}
            >
                Skip Swap
            </button>
        </div>
    </div>
</div>