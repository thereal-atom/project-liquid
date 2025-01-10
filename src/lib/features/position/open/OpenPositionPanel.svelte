<script lang="ts">
    import { WSOLMint, type AmmRpcData, type ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

    import { getAppState } from "$lib/context/app.svelte";
	
    import { getTokenPrices } from "$lib/api/marketData";
    
	import OpenPositionModal from "./OpenPositionModal.svelte";
	import PoolInfoPanel from "$lib/features/pool/PoolInfoPanel.svelte";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData?: AmmRpcData;
        tokenBalances: Record<string, number>;
    };
    const { pool, poolRpcData, tokenBalances }: Props = $props();
	
    const app = getAppState();

    let tokenPrices: Record<string, number> | undefined = $state();

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

    let depositAmount = $state(0);

    let amountLpToken = $state(0);
    let proportionLpToken = $state(0);

    let amountMintA = $state(0);
    let amountMintB = $state(0);

    let usdAmountMintA = $state(0);
    let usdAmountMintB = $state(0);

    const handleChangeDepositAmount = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        const amount = parseFloat(value);
        depositAmount = amount;

        if (!pool) return;

        amountLpToken = depositAmount / pool.lpPrice;
        proportionLpToken = amountLpToken / pool.lpAmount;

        amountMintA = proportionLpToken * pool.mintAmountA;
        amountMintB = proportionLpToken * pool.mintAmountB;

        if (!tokenPrices) return;

        usdAmountMintA = amountMintA * tokenPrices[pool.mintA.address];
        usdAmountMintB = amountMintB * tokenPrices[pool.mintB.address];
    };

    let isConfirmPositionModalOpen = $state(false);
</script>

{#if poolRpcData}
    <OpenPositionModal
        {pool}
        {poolRpcData}
        {tokenBalances}
        uiAmountIn={amountMintA}
        {isConfirmPositionModalOpen}
    />
{/if}

{#if pool}
    <div class="p-16">
        <div class="flex flex-row justify-center mt-8">
            <div class="flex flex-col">
                <div class="flex flex-col w-[736px]">
                    <div class="flex flex-row w-full p-4 bg-primary border border-secondary/20 rounded-md">
                        <div class="flex flex-row items-center">
                            <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                                <img
                                    class="w-8 min-w-8 h-8 rounded-full"
                                    src={pool.mintA.logoURI}
                                    alt={pool.mintA.symbol}
                                />
                            </div>
                            <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                                <img
                                    class="w-8 min-w-8 h-8 rounded-full"
                                    src={pool.mintB.logoURI}
                                    alt={pool.mintB.symbol}
                                />
                            </div>
                            <p class="ml-2 font-bold">{pool.mintA.symbol}/{pool.mintB.symbol}</p>
                        </div>
                    </div>
                    <div class="flex flex-row mt-4">
                        <div class="flex flex-col w-full">
                            <div class="flex flex-col p-8 bg-primary border border-secondary/20 rounded-md">
                                <p class="font-semibold">Deposit Amount</p>
                                <div class="flex flex-row mt-2 pl-3 border border-secondary/20 rounded-md">
                                    <p class="font-semibold opacity-50 py-3">$</p>
                                    <input
                                        class="w-full ml-2 py-3 font-semibold bg-transparent"
                                        type="text"
                                        placeholder="0.00"
                                        oninput={handleChangeDepositAmount}
                                    />
                                </div>
                                <div class="flex flex-col mt-4">
                                    <div class="flex flex-col">
                                        <div class="flex flex-row items-center">
                                            <img
                                                class="w-4 h-4 opacity-50"
                                                src="/icons/wallet.svg"
                                                alt="wallet"
                                            />
                                            <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[WSOLMint.toBase58()]}</p>
                                        </div>
                                        <div class="flex flex-row items-center justify-between mt-1">
                                            <div class="flex flex-row items-center">
                                                <div class="w-7 h-7 p-1 bg-white/20 rounded-full">
                                                    <img
                                                        class="w-5 min-w-5 h-5 rounded-full"
                                                        src={pool.mintA.logoURI}
                                                        alt={pool.mintA.symbol}
                                                    />
                                                </div>
                                                <p class="ml-2 font-semibold">{(amountMintA).toLocaleString()} {pool.mintA.symbol}</p>
                                            </div>
                                            <p class="font-semibold">${usdAmountMintA.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div class="flex flex-col mt-4">
                                        <div class="flex flex-row items-center">
                                            <img
                                                class="w-4 h-4 opacity-50"
                                                src="/icons/wallet.svg"
                                                alt="wallet"
                                            />
                                            <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[pool.mintB.address]}</p>
                                        </div>
                                        <div class="flex flex-row items-center justify-between mt-1">
                                            <div class="flex flex-row items-center">
                                                <div class="w-7 h-7 p-1 bg-white/20 rounded-full">
                                                    <img
                                                        class="w-5 min-w-5 h-5 rounded-full"
                                                        src={pool.mintB.logoURI}
                                                        alt={pool.mintB.symbol}
                                                    />
                                                </div>
                                                <p class="ml-2 font-semibold">{(amountMintB).toLocaleString()} {pool.mintB.symbol}</p>
                                            </div>
                                            <p class="font-semibold">${usdAmountMintB.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <!-- <button
                                        class="mt-4 py-2 bg-accent text-sm font-bold rounded-md"
                                        onclick={() => {
                                            isConfirmPositionModalOpen = true;
                                            calculateSwapAmounts();
                                            calculateAddLiquidityAmounts();
                                        }}
                                        disabled={isInvalid}
                                    >
                                        Open Position
                                    </button> -->
                                    <button
                                        class="mt-4 py-2 bg-accent text-sm font-bold rounded-md"
                                        onclick={() => isConfirmPositionModalOpen = true}
                                    >
                                        Open Position
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col w-full mt-4">
                        <div class="flex flex-col p-8 bg-primary border border-secondary/20 rounded-md">
                            <p class="font-semibold">Estimated Fees</p>
                            <div class="flex flex-row justify-between mt-2">
                                <div class="flex flex-col">
                                    <p class="text font-medium opacity-60 text-secondary">24h ({(pool.day.apr / 365).toFixed(2)}%)</p>
                                    <p class="mt-1 text-green-400 font-semibold">${(depositAmount * (pool.day.apr / 365 / 100)).toFixed(2)}</p>
                                </div>
                                <div class="flex flex-col">
                                    <p class="text font-medium opacity-60 text-secondary">Monthly ({(pool.day.apr / 365 * 30).toFixed(2)}%)</p>
                                    <p class="mt-1 text-green-400 font-semibold">${(depositAmount * (pool.day.apr / 365 * 30 / 100)).toFixed(2)}</p>
                                </div>
                                <div class="flex flex-col">
                                    <p class="text font-medium opacity-60 text-secondary">Yearly (APR) ({(pool.day.apr).toFixed(2)}%)</p>
                                    <p class="mt-1 text-green-400 font-semibold">${(depositAmount * (pool.day.apr / 100)).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ml-5">
                <PoolInfoPanel {pool} />
            </div>
        </div>
    </div>
{:else}
    <p>Loading Pool.</p>
{/if}