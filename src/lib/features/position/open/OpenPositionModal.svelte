<script lang="ts">
	import type { ApiV3PoolInfoStandardItem, AmmRpcData } from "@raydium-io/raydium-sdk-v2";

	import Modal from "$lib/components/Modal.svelte";
	import OpenPositionSwap from "./OpenPositionSwap.svelte";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        tokenBalances: Record<string, number>;
        uiAmountIn: number;
        isConfirmPositionModalOpen: boolean;
    };
    let { pool, poolRpcData, tokenBalances, uiAmountIn, isConfirmPositionModalOpen }: Props = $props();

    // // ? swap
    // let isLoadingSwapQuote = $state(false);

    // let swapAmountA = $state(0);
    // let swapAmountB = $state(0);

    // // let lastQuoteTimestamp = $state(0);

    // const calculateSwapAmounts = () => {
    //     if (!app.raydiumClient || !poolRpcData) return;

    //     // todo: handle this debounce better because it's not async check if I even need it
    //     // const now = Date.now();
    //     // if (now - lastQuoteTimestamp < 200) return;

    //     // todo: use function in raydium utils. 'calculateRaydiumSwapQuote(app.raydiumClient, { pool, poolRpcData, uiAmountSol })'
    //     const quote = app.raydiumClient.liquidity.computeAmountOut({
    //         poolInfo: {
    //             ...pool,
    //             baseReserve: poolRpcData.baseReserve,
    //             quoteReserve: poolRpcData.quoteReserve,
    //             status: poolRpcData.status.toNumber(),
    //             version: 4,
    //         },
    //         amountIn: new BN(amountMintA * 10 ** 9),
    //         mintIn: pool.mintA.address,
    //         mintOut: pool.mintB.address,
    //         slippage: 0.01,
    //     });

    //     // lastQuoteTimestamp = now;

    //     swapAmountA = amountMintA;
    //     swapAmountB = quote.amountOut.toNumber() / 10 ** pool.mintB.decimals;
    // };

    // const handleConfirmSwap = async () => {
    //     const provider = getPhantomProvider();

    //     if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

    //     calculateSwapAmounts();

    //     // check balance
    //     // no need to refetch token balances because they were fetched on page load - if they've changed (unlikely)
    //     // then the transaction will show that it'll fail due to insufficient balance
    //     // just need to disable buttons if balance is wrong
    //     // can fetch balances after a function runs.
    //     // can use websockets to listen for account changes/transactions?
    //     // best of both worlds - recent data, not hitting rate limits

    //     isLoading = true;

    //     try {
    //         const { transaction } = await app.raydiumClient.liquidity.swap({
    //             poolInfo: pool,
    //             poolKeys,
    //             amountIn: new BN(swapAmountA * 10 ** 9),
    //             amountOut: new BN(swapAmountB * 10 ** pool.mintB.decimals),
    //             fixedSide: "in",
    //             inputMint: pool.mintA.address,
    //             txVersion: constants.txVersion,
    //         });

    //         const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
    //         transaction.recentBlockhash = blockhash;

    //         const { signature } = await provider.signAndSendTransaction(transaction);

    //         // nothing after this runs until user confirms transaction
    //         // user confirming transaction DOESN'T mean the transaction is successful

    //         console.log(signature);
                
    //         isLoading = false;
    //     } catch (err) {
    //         console.log(err);

    //         toaster.add({
    //             title: "Error",
    //             message: "Failed to swap.",
    //             type: "error",
    //         });

    //         isLoading = false;
    //     };
    // };

    // // ? add liquidity

    // let addLiquidityAmountA = $state(0);
    // let addLiquidityAmountB = $state(0);
    // let addLiquidityMinAmountB = $state(0);

    // const calculateAddLiquidityAmounts = () => {
    //     if (!app.raydiumClient || !poolRpcData) return;

    //     const quote = app.raydiumClient.liquidity.computePairAmount({
    //         poolInfo: pool,
    //         amount: amountMintA.toString(),
    //         // todo:
    //         baseIn: true,
    //         slippage: new Percent(3),
    //     });

    //     addLiquidityAmountA = amountMintA;
    //     addLiquidityAmountB = parseFloat(quote.anotherAmount.toExact());
    //     addLiquidityMinAmountB = parseFloat(quote.anotherAmount.toExact());
    // };

    // const handleConfirmAddLiquidity = async () => {
    //     const provider = getPhantomProvider();

    //     if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

    //     calculateAddLiquidityAmounts();

    //     isLoading = true;

    //     try {
    //         const { transaction } = await addRaydiumLiquidity(app.raydiumClient, {
    //             poolInfo: pool,
    //             poolKeys,
    //             amountA: addLiquidityAmountA,
    //             amountB: addLiquidityAmountB,
    //             minAmountB: addLiquidityMinAmountB,
    //             mintA: pool.mintA,
    //             mintB: pool.mintB,
    //         });

    //         const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
    //         transaction.recentBlockhash = blockhash;

    //         const { signature } = await provider.signAndSendTransaction(transaction);

    //         console.log(signature);
                
    //         isLoading = false;
    //     } catch (err) {
    //         console.log(err);

    //         isLoading = false;
    //     };
    // };

    // // ? open shorts

    // const handleConfirmOpenShorts = async () => {};

    // // correct name? isInvalid means is the position unable to be opened for reasons like not enough balance
    // let isInvalid = $derived(
    //     isLoading ||
    //     amountMintA > mintABalance ||
    //     amountMintB > mintBBalance ||
    //     depositAmount <= 0
    // );

    /**
     * todo: put into separate function/component? some sort of 'hook' (or custom rune, whatever it's called)
     * if custom rune then something like `useTabs()`
     * or just a component like <TabBar bind:{activeTabIndex}><Tab label="some-label"></TabBar> etc
    */

    let confirmPositionModalTabs = $state({
        activeTabIndex: 0,
        tabs: [
            { label: "Step 1: Swap" },
            { label: "Step 2: Add Liquidity" },
            { label: "Step 3: Open Shorts" },
        ],
    });
</script>

<Modal
    bind:isOpen={isConfirmPositionModalOpen}
    close={() => isConfirmPositionModalOpen = false}
>
    <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col w-[600px] h-[600px] p-8 bg-[#0C0910] border border-secondary/20 rounded-md z-20">
        <p class="text-xl font-bold">Confirm Position</p>
        <div class="flex flex-row my-4 bg-primary/50 border border-secondary/10 rounded-md">
            {#each confirmPositionModalTabs.tabs as tab, i}
                <button
                    class="w-1/3 py-3 text-sm text-center font-semibold {i !== 0 ? "border-l border-secondary/10" : ""} {confirmPositionModalTabs.activeTabIndex === i ? "bg-secondary/20" : "bg-primary/50"} {i === 0 ? "rounded-l-md" : ""} {i === confirmPositionModalTabs.tabs.length - 1 ? "rounded-r-md" : ""}"
                    onclick={() => confirmPositionModalTabs.activeTabIndex = i}
                >
                    {tab.label}
                </button>
            {/each}
        </div>
        <div class="flex flex-col h-full mt-8">
            {#if confirmPositionModalTabs.activeTabIndex === 0}
                <OpenPositionSwap
                    {pool}
                    {poolRpcData}
                    {tokenBalances}
                    {uiAmountIn}
                />
            {:else if confirmPositionModalTabs.activeTabIndex === 1}
                <p>add liquidity section</p>
            {:else if confirmPositionModalTabs.activeTabIndex === 2}
                <p>open short section</p>
            {/if}
        </div>
    </div>
</Modal>