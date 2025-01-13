<script lang="ts">
    import { type AmmRpcData, type AmmV4Keys, type AmmV5Keys, type ApiV3PoolInfoStandardItem, LiquidityMath } from "@raydium-io/raydium-sdk-v2";

    import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	
    import { getTokenPrices } from "$lib/api/marketData";
    
	import OpenPositionModal from "../modal/OpenPositionModal.svelte";
	import TokenInput from "./TokenInput.svelte";
	import WalletConnectedButton from "$lib/components/WalletConnectedButton.svelte";

	import { getRaydiumAddLiquidityQuote } from "$lib/utils/raydium";
	import { getMintSymbol } from "$lib/utils/solana";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData?: AmmRpcData;
        poolKeys?: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
    };
    const { pool, poolRpcData, poolKeys, tokenBalances }: Props = $props();

    const updateTokenPrices = () => {
        if (!pool) return;

        getTokenPrices([
            pool.mintA.address,
            pool.mintB.address,
        ]).then(prices => {
            tokenPrices = prices;
        });
    };

    $effect(() => {
        if (app.raydiumClient && app.connection) {
            updateTokenPrices();
        };
    });

    const app = getAppState();
    const wallet = getWalletState();

    let tokenPrices: Record<string, number> | undefined = $state();

    let isConfirmPositionModalOpen = $state(false);

    let totalDeposit = $state(0);

    let amountMintA: number | undefined = $state(undefined);
    let amountMintB: number | undefined = $state(undefined);

    let usdAmountMintA = $state(0);
    let usdAmountMintB = $state(0);

    const handleInputMintA = (amount: number) => {
        if (!app.raydiumClient) return;

        const quote = getRaydiumAddLiquidityQuote(app.raydiumClient, {
            poolInfo: pool,
            baseIn: true,
            uiAmountIn: amount,
        });

        const uiAmountB = parseInt(quote.anotherAmount.toFixed()) / 10 ** pool.mintA.decimals;

        amountMintB = uiAmountB;

        if (!tokenPrices) return;

        usdAmountMintA = amount * tokenPrices[pool.mintA.address];
        usdAmountMintB = uiAmountB * tokenPrices[pool.mintB.address];

        totalDeposit = usdAmountMintA + usdAmountMintB;
    };

    const handleInputMintB = (amount: number) => {
        if (!app.raydiumClient) return;

        const quote = getRaydiumAddLiquidityQuote(app.raydiumClient, {
            poolInfo: pool,
            baseIn: false,
            uiAmountIn: amount,
        });
        
        const uiAmountA = parseInt(quote.anotherAmount.toFixed()) / 10 ** pool.mintB.decimals;

        amountMintA = uiAmountA;

        if (!tokenPrices) return;

        usdAmountMintA = uiAmountA * tokenPrices[pool.mintA.address];
        usdAmountMintB = amount * tokenPrices[pool.mintB.address];

        totalDeposit = usdAmountMintA + usdAmountMintB;
    };
</script>

{#if poolRpcData && poolKeys}
    <OpenPositionModal
        {pool}
        {poolRpcData}
        {poolKeys}
        {tokenBalances}
        uiAmountIn={amountMintA || 0}
        bind:isOpen={isConfirmPositionModalOpen}
    />
{/if}

{#if pool}
    <div class="flex flex-col">
        <div class="flex flex-col w-[736px]">
            <div class="flex flex-row w-full p-4 bg-primary border border-secondary/20 rounded-md">
                <div class="flex flex-row items-center">
                    <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                        <img
                            class="w-8 min-w-8 h-8 rounded-full"
                            src={pool.mintA.logoURI}
                            alt={getMintSymbol(pool.mintA)}
                        />
                    </div>
                    <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                        <img
                            class="w-8 min-w-8 h-8 rounded-full"
                            src={pool.mintB.logoURI}
                            alt={getMintSymbol(pool.mintB)}
                        />
                    </div>
                    <p class="ml-2 font-bold">{getMintSymbol(pool.mintA)}/{getMintSymbol(pool.mintB)}</p>
                </div>
            </div>
            <div class="flex flex-row mt-4">
                <div class="flex flex-col w-full">
                    <div class="flex flex-col p-8 bg-primary border border-secondary/20 rounded-md">
                        <div class="mt-2">
                            <TokenInput
                                mint={pool.mintA}
                                bind:amount={amountMintA}
                                price={tokenPrices ? tokenPrices[pool.mintA.address] : 0}
                                balance={tokenBalances[pool.mintA.address] || 0}
                                onInput={handleInputMintA}
                            />
                        </div>
                        <div class="mt-4">
                            <TokenInput
                                mint={pool.mintB}
                                bind:amount={amountMintB}
                                price={tokenPrices ? tokenPrices[pool.mintB.address] : 0}
                                balance={tokenBalances[pool.mintB.address] || 0}
                                onInput={handleInputMintB}
                            />
                        </div>
                        <div class="flex flex-row justify-between mt-4 p-6 bg-secondary/5 rounded-md">
                            <p class="font-medium opacity-80">Total Deposit</p>
                            <p class="font-bold">${totalDeposit.toLocaleString()}</p>
                        </div>
                        <WalletConnectedButton
                            className="standard-button mt-4"
                            onClick={() => isConfirmPositionModalOpen = true}
                            isDisabled={totalDeposit === undefined || totalDeposit <= 0 || !poolRpcData || !wallet.pubKeyString}
                            disabledText={[
                                (!totalDeposit || totalDeposit <= 0) && "Enter Amount"
                            ]}
                        >
                            <p>Open Position</p>
                        </WalletConnectedButton>
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-full mt-4">
                <div class="flex flex-col p-8 bg-primary border border-secondary/20 rounded-md">
                    <p class="font-semibold">Estimated Fees</p>
                    <div class="flex flex-row justify-between mt-2">
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">24h ({(pool.day.apr / 365).toFixed(2)}%)</p>
                            <p class="mt-1 text-green-400 font-semibold">${(totalDeposit * (pool.day.apr / 365 / 100)).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Monthly ({(pool.day.apr / 365 * 30).toFixed(2)}%)</p>
                            <p class="mt-1 text-green-400 font-semibold">${(totalDeposit * (pool.day.apr / 365 * 30 / 100)).toFixed(2)}</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text font-medium opacity-60 text-secondary">Yearly (APR) ({(pool.day.apr).toFixed(2)}%)</p>
                            <p class="mt-1 text-green-400 font-semibold">${(totalDeposit * (pool.day.apr / 100)).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <p>Loading Pool.</p>
{/if}