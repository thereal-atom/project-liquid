<script lang="ts">
    import { publicKey, WSOLMint, type AmmRpcData, type AmmV4Keys, type AmmV5Keys, type ApiV3PoolInfoStandardItem, LiquidityMath } from "@raydium-io/raydium-sdk-v2";

    import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	
    import { getTokenPrices } from "$lib/api/marketData";
    
	import OpenPositionModal from "./modal/OpenPositionModal.svelte";
	import { getRaydiumAddLiquidityQuote } from "$lib/utils/raydium";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData?: AmmRpcData;
        poolKeys?: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
    };
    const { pool, poolRpcData, poolKeys, tokenBalances }: Props = $props();

    const app = getAppState();
    const wallet = getWalletState();

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

    let isConfirmPositionModalOpen = $state(false);

    let depositAmount = $state(0);

    let amountMintA = $state(0);
    let amountMintB = $state(0);

    let usdAmountMintA = $state(0);
    let usdAmountMintB = $state(0);

    // const handleChangeDepositAmount = (e: Event) => {
    //     const value = (e.target as HTMLInputElement).value;

    //     const amount = parseFloat(value);
    //     depositAmount = amount;

    //     if (!pool) return;

    //     // todo: amountMintA and amountMintB are calculated by proportions of lp data
    //     // it's pretty much fine, but .lpPrice and .lpAmount don't update, so amounts become stale
    //     // idea is to get add liquidity quote, with input as 1 sol, and then calculate the proportions
    //     // but that's a bit of extra code (and will be repeated in ModalAddLiquiditySection, but it'd be even worse to pass it all the way down I think),
    //     // so fine to leave as it is for now, especially because it does (will) update in ModalAddLiquiditySection

    //     const amountLpToken = depositAmount / pool.lpPrice;
    //     const proportionLpToken = amountLpToken / pool.lpAmount;

    //     amountMintA = proportionLpToken * pool.mintAmountA;
    //     amountMintB = proportionLpToken * pool.mintAmountB;

    //     if (!tokenPrices) return;

    //     usdAmountMintA = amountMintA * tokenPrices[pool.mintA.address];
    //     usdAmountMintB = amountMintB * tokenPrices[pool.mintB.address];
    // };

    const handleInputMintA = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        const amount = parseFloat(value);

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
    };

    const handleInputMintB = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        const amount = parseFloat(value);

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
    };

    $effect(() => {
        if (app.raydiumClient && app.connection) {
            updateTokenPrices();
        };
    });

    // todo: thinking of changing the idea a bit. input mint amount a or b instead of the usd amount
    // can still have a utility to get the input a and b amounts from usd amount (either they can input, get result and input themselves, or it just auto inputs)
</script>

{#if poolRpcData && poolKeys}
    <OpenPositionModal
        {pool}
        {poolRpcData}
        {poolKeys}
        {tokenBalances}
        uiAmountIn={amountMintA}
        isOpen={isConfirmPositionModalOpen}
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
                        <!-- <p class="font-semibold">Deposit Amount</p>
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
                                    <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[WSOLMint.toBase58()] || 0}</p>
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
                                    <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[pool.mintB.address] || 0}</p>
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
                            <button
                                class="mt-4 py-2 bg-accent text-sm font-bold rounded-md"
                                onclick={() => isConfirmPositionModalOpen = true}
                                disabled={depositAmount <= 0 || !poolRpcData || !wallet.pubKeyString}
                            >
                                {#if !wallet.pubKeyString}
                                    Wallet Not Connected
                                {:else if depositAmount <= 0}
                                    Enter Amount
                                {:else}
                                    Open Position
                                {/if}
                            </button>
                        </div> -->
                        <div class="flex flex-col">
                            <div class="flex flex-row items-center">
                                <img
                                    class="w-4 h-4 opacity-50"
                                    src="/icons/wallet.svg"
                                    alt="wallet"
                                />
                                <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[pool.mintA.address] || 0}</p>
                            </div>
                            <div class="flex flex-row mt-2 p-6 bg-[#0C0910] rounded-md">
                                <div class="flex flex-row items-center w-full">
                                    <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-8 min-w-8 h-8 rounded-full"
                                            src={pool.mintA.logoURI}
                                            alt={pool.mintA.symbol}
                                        />
                                    </div>
                                    <p class="ml-2 text-xl font-semibold">{pool.mintA.symbol}</p>
                                </div>
                                <div class="flex flex-col items-end">
                                    <input
                                        class="bg-inherit font-semibold text-xl text-right"
                                        type="number"
                                        placeholder="0.00"
                                        bind:value={amountMintA}
                                        oninput={handleInputMintA}
                                    />
                                    <p class="mt-1 text-xs font-medium opacity-50">~${usdAmountMintA.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col mt-4">
                            <div class="flex flex-row items-center">
                                <img
                                    class="w-4 h-4 opacity-50"
                                    src="/icons/wallet.svg"
                                    alt="wallet"
                                />
                                <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances[pool.mintB.address] || 0}</p>
                            </div>
                            <div class="flex flex-row mt-2 p-6 bg-[#0C0910] rounded-md">
                                <div class="flex flex-row items-center w-full">
                                    <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-8 min-w-8 h-8 rounded-full"
                                            src={pool.mintB.logoURI}
                                            alt={pool.mintB.symbol}
                                        />
                                    </div>
                                    <p class="ml-2 text-xl font-semibold">{pool.mintB.symbol}</p>
                                </div>
                                <div class="flex flex-col items-end">
                                    <input
                                        class="bg-inherit font-semibold text-xl text-right"
                                        type="number"
                                        placeholder="0.00"
                                        bind:value={amountMintB}
                                        oninput={handleInputMintB}
                                    />
                                    <p class="mt-1 text-xs font-medium opacity-50">~${usdAmountMintB.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-row justify-between mt-4 p-6 bg-secondary/5 rounded-md">
                            <p class="font-medium opacity-80">Total Deposit</p>
                            <p class="font-bold">${usdAmountMintA + usdAmountMintB}</p>
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
{:else}
    <p>Loading Pool.</p>
{/if}

<style>
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield;
    }
</style>