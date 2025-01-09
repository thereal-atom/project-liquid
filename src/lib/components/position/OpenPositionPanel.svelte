<script lang="ts">
    import { type ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

    import { copy } from "$lib/actions/copy.svelte.js";
    import { getAppState } from "$lib/context/app.svelte";
	
	import { truncateString } from "$lib/utils/common";
    import { getTokenPrices } from "$lib/api/marketData";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        tokenBalances: Record<string, number>;
    };
    const { pool, tokenBalances }: Props = $props();
	
    // todo: useful functions: https://github.com/raydium-io/raydium-ui-v3/blob/master/src/utils/token.ts#L7

    const app = getAppState();

    let tokenPrices: Record<string, number> | undefined = $state();

    const updateTokenPrices = () => {
        console.log("attempting to update token prices");

        if (!pool) return;

        console.log("updating token prices");

        getTokenPrices([
            pool.mintA.address,
            pool.mintB.address,
        ]).then(prices => {
            tokenPrices = prices;
        });
    };

    $effect(() => {
        console.log("effect");
        if (app.raydiumClient && app.connection) {
            console.log("effect - updating data");

            updateTokenPrices();
        };
    });

    // onMount(() => {
    //     // fetch(`http://localhost:5173/api/pool/${pool.id}/rpc-data`)
    //     //     .then(res => {
    //     //         console.log(res);
    //     //     });

    //     // todo: error handling for things like this (external api calls, rpc calls, etc)
    //     // want to see logs in vercel of this
    //     updatePoolInfo();
    //     if (!pool) return;

    //     updateTokenPrices();
    //     updatePoolData();

    //     const updateMarketDataInterval = setInterval(() => {
    //         updateTokenPrices();
    //         updatePoolData();
    //     }, 20_000);

    //     const tokenAccountStore = wallet.getTokenAccount(pool.mintB.address);
    //     if (!tokenAccountStore || (Date.now() - tokenAccountStore.lastUpdatedTimestamp) > 30_000) {
    //         console.log(`fetching token account for ${pool.mintB.address} as local data is ${Date.now() - (tokenAccountStore?.lastUpdatedTimestamp || 0)} ms old`);
    //         if (!app.connection || !wallet.pubKeyString) return;

    //         // todo: put into function like getParsedTokenAccountsByOwner(app.connection, wallet.pubKeyString, { mint: new PublicKey(pool.mintB.address) })
    //         // balance updated on any sort of action ('add liquidity', 'swap', etc) with 30s expiry. data goes into local store
    //         app.connection
    //             .getParsedTokenAccountsByOwner(
    //                 new PublicKey(wallet.pubKeyString || ""),
    //                 // solana token program:
    //                 {
    //                     mint: new PublicKey(pool.mintB.address),
    //                     programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    //                 },
    //             )
    //             .then(({ value }) => {
    //                 if (!pool) return;

    //                 const mintBTokenAccount = value[0];
    //                 if (!mintBTokenAccount) return;

    //                 const mintBAmount = mintBTokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    //                 mintBBalance = mintBAmount;

    //                 console.log("setting token account");

    //                 wallet.setTokenAccount(pool.mintB.address, {
    //                     balance: mintBBalance,
    //                 });
    //             });
    //     } else {
    //         mintBBalance = tokenAccountStore.balance;
    //     };

    //     // if (!app.connection || !wallet.pubKeyString) return;

    //     // // ! rpc call - called once
    //     // // ! rpc once then ws or ws from the start?
    //     // app.connection
    //     //     .getBalance(new PublicKey(wallet.pubKeyString || ""))
    //     //     .then((balance) => {
    //     //         mintABalance = balance / 10 ** 9;
    //     //     });

    //     return () => clearInterval(updateMarketDataInterval);
    // });

    let depositAmount = $state(0);

    let amountLpToken = $state(0);
    let proportionLpToken = $state(0);

    let amountMintA = $state(0);
    let amountMintB = $state(0);

    let usdAmountMintA = $state(0);
    let usdAmountMintB = $state(0);

    const handleChangeDepositAmount = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        // if (value.test()) { };

        const amount = parseFloat(value);
        depositAmount = amount;

        if (!pool) return;

        amountLpToken = depositAmount / pool.lpPrice;
        proportionLpToken = amountLpToken / pool.lpAmount;

        amountMintA =proportionLpToken * pool.mintAmountA;
        amountMintB =proportionLpToken * pool.mintAmountB;

        if (!tokenPrices) return;

        usdAmountMintA =amountMintA * tokenPrices[pool.mintA.address];
        usdAmountMintB =amountMintB * tokenPrices[pool.mintB.address];
    };

    // let amountLpToken = $derived(depositAmount / pool.lpPrice);
    // let proportionLpToken = $derived(amountLpToken / pool.lpAmount);

    // let amountMintA = $derived(proportionLpToken * pool.mintAmountA);
    // let amountMintB = $derived(proportionLpToken * pool.mintAmountB);

    // let usdAmountMintA = $derived(amountMintA * tokenPrices[pool.mintA.address]);
    // let usdAmountMintB = $derived(amountMintB * tokenPrices[pool.mintB.address]);
</script>

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
                                            <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{tokenBalances["sol"]}</p>
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
            <div class="flex flex-col ml-4">
                <div class="flex flex-col w-[400px] p-4 bg-primary border border-secondary/20 rounded-md">
                    <p class="font-bold">LP Pool</p>
                    <div class="flex flex-row items-center justify-between mt-2">
                        <p class="text-xs font-medium">{pool.mintA.symbol}</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintA.address, 8, 8)}</p>
                            <button use:copy={{ text: pool.mintA.address }}>
                                <img
                                    src="/icons/copy.svg"
                                    alt="copy"
                                    class="w-4 h-4 ml-2"
                                />
                            </button>
                            <a
                                href="https://dexscreener.com/solana/{pool.mintA.address}"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/icons/link-external.svg"
                                    alt="link external"
                                    class="w-4 h-4 ml-1"
                                />
                            </a>
                        </div>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-1.5">
                        <p class="text-xs font-medium">{pool.mintB.symbol}</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintB.address, 8, 8)}</p>
                            <button use:copy={{ text: pool.mintB.address }}>
                                <img
                                    src="/icons/copy.svg"
                                    alt="copy"
                                    class="w-4 h-4 ml-2"
                                />
                            </button>
                            <a
                                href="https://dexscreener.com/solana/{pool.mintB.address}"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/icons/link-external.svg"
                                    alt="link external"
                                    class="w-4 h-4 ml-1"
                                />
                            </a>
                        </div>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-4">
                        <p class="text-xs font-medium">LP Mint</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.lpMint.address, 8, 8)}</p>
                            <button use:copy={{ text: pool.lpMint.address }}>
                                <img
                                    src="/icons/copy.svg"
                                    alt="copy"
                                    class="w-4 h-4 ml-2"
                                />
                            </button>
                            <a
                                href="https://solscan.io/token/{pool.lpMint.address}"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/icons/link-external.svg"
                                    alt="link external"
                                    class="w-4 h-4 ml-1"
                                />
                            </a>
                        </div>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-1.5">
                        <p class="text-xs font-medium">Pool Id</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.id, 8, 8)}</p>
                            <button use:copy={{ text: pool.id }}>
                                <img
                                    src="/icons/copy.svg"
                                    alt="copy"
                                    class="w-4 h-4 ml-2"
                                />
                            </button>
                            <a
                                href="https://raydium.io/liquidity/increase/?mode=add&pool_id={pool.id}"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img
                                    src="/icons/link-external.svg"
                                    alt="link external"
                                    class="w-4 h-4 ml-1"
                                />
                            </a>
                        </div>
                    </div>
                    <hr class="w-full h-[1px] my-4 bg-white/20 border-none" />
                    <div class="flex flex-row items-center justify-between">
                        <p class="text-xs font-medium">Pool Liquidity</p>
                        <p class="text-xs font-medium">${pool.tvl.toLocaleString()}</p>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-4">
                        <div class="flex flex-row items-center">
                            <p class="text-xs font-medium">Pooled {pool.mintA.symbol}</p>
                            <div class="w-4 h-4 ml-1 p-0.5 bg-white/20 rounded-full">
                                <img
                                    class="w-3 min-w-3 h-3 rounded-full"
                                    src={pool.mintA.logoURI}
                                    alt={pool.mintA.symbol}
                                />
                            </div>
                        </div>
                        <p class="text-xs font-medium">{pool.mintAmountA.toLocaleString()}</p>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-1.5">
                        <div class="flex flex-row items-center">
                            <p class="text-xs font-medium">Pooled {pool.mintB.symbol}</p>
                            <div class="w-4 h-4 ml-1 p-0.5 bg-white/20 rounded-full">
                                <img
                                    class="w-3 min-w-3 h-3 rounded-full"
                                    src={pool.mintB.logoURI}
                                    alt={pool.mintB.symbol}
                                />
                            </div>
                        </div>
                        <p class="text-xs font-medium">{pool.mintAmountB.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
{:else}
    <p>Loading Pool.</p>
{/if}