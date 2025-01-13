<script lang="ts">
	import { onMount } from "svelte";

	import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

	import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getToasterState } from "$lib/context/toaster.svelte";

	import { getPhantomProvider } from "$lib/utils/phantom";
	import { getMintSymbol, getPoolSolMint } from "$lib/utils/solana";
	import { addRaydiumLiquidity, getRaydiumAddLiquidityQuote } from "$lib/utils/raydium";
	import WalletConnectedButton from "$lib/components/WalletConnectedButton.svelte";
    
    const app = getAppState();
    const wallet = getWalletState();
    const toaster = getToasterState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        poolKeys: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
        uiAmountMintA: number;
        onSkipAddLiquidity: () => void;
    };
    const { pool, poolRpcData, poolKeys, tokenBalances, uiAmountMintA, onSkipAddLiquidity }: Props = $props();

    onMount(() => { calculateAddLiquidityAmounts() });
    
    $effect(() => {
        if (poolRpcData) {
            calculateAddLiquidityAmounts();
        };
    });

    let uiAddLiquidityAmountA = $state(0);
    let uiAddLiquidityAmountB = $state(0);
    let uiAddLiquidityMinAmountB = $state(0);
    let uiAddLiquidityMaxAmountB = $state(0);

    const calculateAddLiquidityAmounts = () => {
        if (!app.raydiumClient || !poolRpcData) return;

        const quote = getRaydiumAddLiquidityQuote(app.raydiumClient, {
            poolInfo: pool,
            baseIn: true,
            uiAmountIn: uiAmountMintA,
        });

        uiAddLiquidityAmountA = uiAmountMintA;
        uiAddLiquidityAmountB = parseFloat(quote.anotherAmount.toExact()) / 10 ** pool.mintA.decimals;
        // note: here (another other places with amount vs ui amount, but specifically swap-like actions), the output is mint b amount, but needs to be divided by mintA decimals
        // to get the ui actual amount. or is it a fixed amount?. either way it's confusing so need to research more.
        uiAddLiquidityMinAmountB = parseFloat(quote.minAnotherAmount.toExact()) / 10 ** pool.mintA.decimals;
        uiAddLiquidityMaxAmountB = parseFloat(quote.maxAnotherAmount.toExact()) / 10 ** pool.mintA.decimals;
    };

    let isLoading = $state(false);

    let isInsufficientMintA = $derived(uiAddLiquidityAmountA > (tokenBalances[pool.mintA.address] - 0.1));
    let isInsufficientMintB = $derived(uiAddLiquidityAmountB > (tokenBalances[pool.mintB.address] - 0.1));
    let isWalletConnected = $derived(wallet.pubKeyString !== null);

    const handleConfirmAddLiquidity = async () => {
        calculateAddLiquidityAmounts();

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
        } else if (isInsufficientMintB) {
            toaster.add({
                title: "Error Swapping (Balance)",
                message: `Insufficient ${getMintSymbol(pool.mintB)}.`,
                type: "error",
            });

            return;
        } else if (uiAddLiquidityAmountA > 100) {
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
            const { transaction } = await addRaydiumLiquidity(app.raydiumClient, {
                poolInfo: pool,
                poolKeys,
                uiAmountA: uiAddLiquidityAmountA,
                uiAmountB: uiAddLiquidityMaxAmountB,
                uiMinAmountB: uiAddLiquidityMinAmountB,
                mintA: pool.mintA,
                mintB: pool.mintB,
            });

            const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
            transaction.recentBlockhash = blockhash;

            const { signature } = await provider.signAndSendTransaction(transaction);

            // nothing after this runs until user confirms transaction
            // user confirming transaction DOESN'T mean the transaction is successful

            // todo: fetch transaction to check status
            console.log(signature);

            toaster.add({
                title: "Success! Transaction confirmed.",
                message: `${uiAddLiquidityAmountA} ${getMintSymbol(pool.mintA)} and ${uiAddLiquidityAmountB} ${getMintSymbol(pool.mintB)} added to liquidity pool.`,
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
            <p class="ml-1 font-semibold">Step 2: Add Liquidity</p>
        </div>
        <!-- todo: this will be better in a tooltip -->
        <!-- <p class="mt-1 text-xs font-medium text-gray-500">Deposit tokens into a liquidity pool to make passive profit from fees. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p> -->
        <div class="flex flex-col mt-4">
            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{uiAddLiquidityAmountA.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
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
                <div class="flex flex-row items-center justify-between w-full mt-4">
                    <p class="font-bold">{uiAddLiquidityAmountB.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
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
        </div>
    </div>
    <div class="flex flex-col">
        <WalletConnectedButton
            className="standard-button mt-4"
            isDisabled={isLoading}
            disabledText={[
                isInsufficientMintA && `Insufficient ${getMintSymbol(pool.mintA)}`,
                isInsufficientMintB && `Insufficient ${getMintSymbol(pool.mintB)}`,
            ]}
            onClick={handleConfirmAddLiquidity}
        >
            Confirm Add Liquidity
        </WalletConnectedButton>
        <div class="w-full mt-2">
            <button
                class="w-full py-3 bg-primary text-sm font-semibold rounded-md border border-secondary/10"
                disabled={isLoading}
                onclick={onSkipAddLiquidity}
            >
                Skip Add Liquidity
            </button>
        </div>
    </div>
</div>