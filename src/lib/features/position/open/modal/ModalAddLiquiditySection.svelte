<script lang="ts">
	import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

	import { getAppState } from "$lib/context/app.svelte";

	import { getPhantomProvider } from "$lib/utils/phantom";
    
    const app = getAppState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        poolKeys: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
    };
    const { pool, poolRpcData, poolKeys, }: Props = $props();

    let uiAddLiquidityAmountA = $state(0);
    let uiAddLiquidityAmountB = $state(0);
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

    let isLoading = $state(false);

    const handleConfirmAddLiquidity = async () => {
        // check wallet connected
        // check balance
        // check amount
        const provider = getPhantomProvider();

        if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

        // calculateAddLiquidityAmounts();

        isLoading = true;

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
    };
</script>

<div class="flex flex-col">
    <p class="font-semibold">Step 2: Add Liquidity</p>
    <p class="mt-1 text-xs font-medium text-gray-500">Deposit tokens into a liquidity pool to make passive profit from fees. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p>
    <div class="flex flex-col mt-4">
        <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
            <div class="flex flex-row items-center justify-between w-full">
                <p class="font-bold">{uiAddLiquidityAmountA.toLocaleString()}</p>
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
            <div class="flex flex-row items-center justify-between w-full mt-4">
                <p class="font-bold">{uiAddLiquidityAmountB.toLocaleString()}</p>
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
            disabled={false}
            onclick={handleConfirmAddLiquidity}
        >
            Confirm Add Liquidity
        </button>
    </div>
</div>
