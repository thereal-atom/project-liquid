<script lang="ts">
    import { onMount } from "svelte";
    import { type AmmRpcData, type AmmV4Keys, type AmmV5Keys, Percent } from "@raydium-io/raydium-sdk-v2";
	import { PublicKey } from "@solana/web3.js";
	import { BN } from "bn.js";

	import Modal from "$lib/components/Modal.svelte";
    
    import { copy } from "$lib/actions/copy.svelte.js";
    import { getAppState } from "$lib/context/app.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getToasterState } from "$lib/context/toaster.svelte.js";
	
	import constants from "$lib/config/constants";
	import { truncateString } from "$lib/utils/common";
	import { addRaydiumLiquidity, getRaydiumPoolInfoFromRpc } from "$lib/utils/raydium";
	import { getPhantomProvider } from "$lib/utils/phantom";
    import { getTokenPrices } from "$lib/api/marketData";
	

    // todo: useful functions: https://github.com/raydium-io/raydium-ui-v3/blob/master/src/utils/token.ts#L7

    /**
     * raydium logs: shows what rpc calls are being made
     * 1736169202783 - rpc: get farm info
     * 1736169202807 - rpc: get owner token acc info
     * 1736169203167 - rpc: get owner token2022 acc info
     * 1736169203578 - rpc: get multiple lp mint acc info
     * 1736169203578 - rpc: get farm ledger info
     */

    const app = getAppState();
    const wallet = getWalletState();
    const toaster = getToasterState();

    let { data } = $props();
    
    let pool = $state(data.pool);
    let poolRpcData: AmmRpcData | undefined = $state(undefined);
    let poolKeys: AmmV4Keys | AmmV5Keys | undefined = $state(undefined);

    let mintABalance = $state(0);
    let mintBBalance = $state(0);

    let isLoading = $state(false);

    let tokenPrices = $state(data.tokenPrices);

    const updateTokenPrices = () => {
        getTokenPrices([
            pool.mintA.address,
            pool.mintB.address,
        ]).then(prices => {
            tokenPrices = prices;
        });
    };

    const updatePoolData = () => {
        if (!app.raydiumClient) return;

        // ! rpc call (every 30 seconds)
        // something like this would need to be in global cache (potentially server cache or just redis)
        // cache can be in memory since ttl is so short and doesn't need to be persisted
        // requires me to use the server to fetch this data rather than client
        // obviously have had issues with getting the data from server to client so make sure that is sorted
        getRaydiumPoolInfoFromRpc(app.raydiumClient, pool.id).then((_pool) => {
            pool.mintAmountA = _pool.poolInfo.mintAmountA;
            pool.mintAmountB = _pool.poolInfo.mintAmountB;

            poolRpcData = _pool.poolRpcData;
            poolKeys = _pool.poolKeys;
        });
    };

    $effect(() => {
        if (app.raydiumClient) {
            updatePoolData();

            app.raydiumClient.liquidity.getRpcPoolInfo
        };
    });

    onMount(() => {
        // fetch(`http://localhost:5173/api/pool/${pool.id}/rpc-data`)
        //     .then(res => {
        //         console.log(res);
        //     });

        updateTokenPrices();

        const updateMarketDataInterval = setInterval(() => {
            updateTokenPrices();
            updatePoolData();
        }, 20_000);

        const tokenAccountStore = wallet.getTokenAccount(pool.mintB.address);
        if (!tokenAccountStore || (Date.now() - tokenAccountStore.lastUpdatedTimestamp) > 30_000) {
            console.log(`fetching token account for ${pool.mintB.address} as local data is ${Date.now() - (tokenAccountStore?.lastUpdatedTimestamp || 0)} ms old`);
            if (!app.connection || !wallet.pubKeyString) return;

            // todo: put into function like getParsedTokenAccountsByOwner(app.connection, wallet.pubKeyString, { mint: new PublicKey(pool.mintB.address) })
            // todo: ws connection to update this (and also the data in local store.)
            // ws.on("accountChange", (accountInfo) => ... wallet.setTokenAccount(accountInfo.mint, { balance: accountInfo...balance }));
            app.connection
                .getParsedTokenAccountsByOwner(
                    new PublicKey(wallet.pubKeyString || ""),
                    // solana token program:
                    {
                        mint: new PublicKey(pool.mintB.address),
                        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                    },
                )
                .then(({ value }) => {
                    const mintBTokenAccount = value[0];
                    if (!mintBTokenAccount) return;

                    const mintBAmount = mintBTokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
                    mintBBalance = mintBAmount;

                    wallet.setTokenAccount(pool.mintB.address, {
                        balance: mintBBalance,
                    });
                });
        } else {
            mintBBalance = tokenAccountStore.balance;
        };

        // if (!app.connection || !wallet.pubKeyString) return;

        // // ! rpc call - called once
        // // ! rpc once then ws or ws from the start?
        // app.connection
        //     .getBalance(new PublicKey(wallet.pubKeyString || ""))
        //     .then((balance) => {
        //         mintABalance = balance / 10 ** 9;
        //     });

        return () => clearInterval(updateMarketDataInterval);
    });

    let depositAmount = $state(0);
    let amountLpToken = $derived(depositAmount / pool.lpPrice);
    let proportionLpToken = $derived(amountLpToken / pool.lpAmount);

    let amountMintA = $derived(proportionLpToken * pool.mintAmountA);
    let amountMintB = $derived(proportionLpToken * pool.mintAmountB);

    let usdAmountMintA = $derived(amountMintA * tokenPrices[pool.mintA.address]);
    let usdAmountMintB = $derived(amountMintB * tokenPrices[pool.mintB.address]);

    // ? swap
    let isLoadingSwapQuote = $state(false);

    let swapAmountA = $state(0);
    let swapAmountB = $state(0);

    // let lastQuoteTimestamp = $state(0);

    const calculateSwapAmounts = () => {
        if (!app.raydiumClient || !poolRpcData) return;

        // todo: handle this debounce better because it's not async. check if I even need it
        // const now = Date.now();
        // if (now - lastQuoteTimestamp < 200) return;

        // todo: use function in raydium utils. 'calculateRaydiumSwapQuote(app.raydiumClient, { pool, poolRpcData, uiAmountSol })'
        const quote = app.raydiumClient.liquidity.computeAmountOut({
            poolInfo: {
                ...pool,
                baseReserve: poolRpcData.baseReserve,
                quoteReserve: poolRpcData.quoteReserve,
                status: poolRpcData.status.toNumber(),
                version: 4,
            },
            amountIn: new BN(amountMintA * 10 ** 9),
            mintIn: pool.mintA.address,
            mintOut: pool.mintB.address,
            slippage: 0.01,
        });

        // lastQuoteTimestamp = now;

        swapAmountA = amountMintA;
        swapAmountB = quote.amountOut.toNumber() / 10 ** pool.mintB.decimals;
    };

    const handleConfirmSwap = async () => {
        const provider = getPhantomProvider();

        if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

        calculateSwapAmounts();

        // check balance
        // no need to refetch token balances because they were fetched on page load - if they've changed (unlikely)
        // then the transaction will show that it'll fail due to insufficient balance
        // just need to disable buttons if balance is wrong
        // can fetch balances after a function runs.
        // can use websockets to listen for account changes/transactions?
        // best of both worlds - recent data, not hitting rate limits

        isLoading = true;

        try {
            const { transaction } = await app.raydiumClient.liquidity.swap({
                poolInfo: pool,
                poolKeys,
                amountIn: new BN(swapAmountA * 10 ** 9),
                amountOut: new BN(swapAmountB * 10 ** pool.mintB.decimals),
                fixedSide: "in",
                inputMint: pool.mintA.address,
                txVersion: constants.txVersion,
            });

            const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
            transaction.recentBlockhash = blockhash;

            const { signature } = await provider.signAndSendTransaction(transaction);

            // nothing after this runs until user confirms transaction
            // user confirming transaction DOESN'T mean the transaction is successful

            console.log(signature);
                
            isLoading = false;
        } catch (err) {
            console.log(err);

            toaster.add({
                title: "Error",
                message: "Failed to swap.",
                type: "error",
            });

            isLoading = false;
        };
    };

    // ? add liquidity

    let addLiquidityAmountA = $state(0);
    let addLiquidityAmountB = $state(0);
    let addLiquidityMinAmountB = $state(0);

    const calculateAddLiquidityAmounts = () => {
        if (!app.raydiumClient || !poolRpcData) return;

        const quote = app.raydiumClient.liquidity.computePairAmount({
            poolInfo: pool,
            amount: amountMintA.toString(),
            // todo:
            baseIn: true,
            slippage: new Percent(3),
        });

        addLiquidityAmountA = amountMintA;
        addLiquidityAmountB = parseFloat(quote.anotherAmount.toExact());
        addLiquidityMinAmountB = parseFloat(quote.anotherAmount.toExact());
    };

    const handleConfirmAddLiquidity = async () => {
        const provider = getPhantomProvider();

        if (!app.raydiumClient || !app.connection || !poolKeys || !provider) return;

        calculateAddLiquidityAmounts();

        isLoading = true;

        try {
            const { transaction } = await addRaydiumLiquidity(app.raydiumClient, {
                poolInfo: pool,
                poolKeys,
                amountA: addLiquidityAmountA,
                amountB: addLiquidityAmountB,
                minAmountB: addLiquidityMinAmountB,
                mintA: pool.mintA,
                mintB: pool.mintB,
            });

            const blockhash = (await app.connection.getLatestBlockhash("finalized")).blockhash;
            transaction.recentBlockhash = blockhash;

            const { signature } = await provider.signAndSendTransaction(transaction);

            console.log(signature);
                
            isLoading = false;
        } catch (err) {
            console.log(err);

            isLoading = false;
        };
    };

    // ? open shorts

    const handleConfirmOpenShorts = async () => {};

    // correct name? isInvalid means is the position unable to be opened for reasons like not enough balance
    let isInvalid = $derived(
        isLoading ||
        amountMintA > mintABalance ||
        amountMintB > mintBBalance ||
        depositAmount <= 0
    );

    /**
     * todo: put into separate function/component? some sort of 'hook' (or custom rune, whatever it's called)
     * if custom rune then something like `useTabs()`
     * or just a component like <TabBar bind:{activeTabIndex}><Tab label="some-label"></TabBar> etc
    */
    let isConfirmPositionModalOpen = $state(false);

    let confirmPositionModalTabs = $state({
        activeTabIndex: 0,
        tabs: [
            { label: "Step 1: Swap" },
            { label: "Step 2: Add Liquidity" },
            { label: "Step 3: Open Shorts" },
        ],
    });
</script>

<!-- todo: put into separate component -->
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
                        onclick={() => confirmPositionModalTabs.activeTabIndex += 1}
                    >
                        Skip Swap
                    </button>
                </div>
            {:else if confirmPositionModalTabs.activeTabIndex === 1}
                <p class="font-semibold">Step 2: Add Liquidity</p>
                <!-- tooltip: deposit the tokens into the liquidity pool to start earning fees. -->
                <div class="flex flex-col mt-4">
                    <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                        <div class="flex flex-row items-center justify-between w-full">
                            <p class="font-bold">{addLiquidityAmountA.toLocaleString()}</p>
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
                            <p class="font-bold">{addLiquidityAmountB.toLocaleString()}</p>
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
                        onclick={handleConfirmAddLiquidity}
                    >
                        Confirm Add Liquidity
                    </button>
                </div>
            {:else if confirmPositionModalTabs.activeTabIndex === 2}
                <p class="font-semibold">Step 3: Open Shorts</p>
                <!-- tooltip: open short positions to hedge against asset value loss. [learn more](link-to-learn-more) about hedging against asset value loss. -->
                <div class="flex flex-col mt-4">
                    <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                        <div class="flex flex-row items-center justify-between w-full">
                            <p class="font-bold">-1.00001</p>
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
                            <p class="font-bold">-2,500.00001</p>
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
                        onclick={handleConfirmOpenShorts}
                    >
                        Confirm Open Shorts
                    </button>
                </div>
            {/if}
        </div>
    </div>
</Modal>

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
                                    bind:value={depositAmount}
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
                                        <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{mintABalance}</p>
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
                                        <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{mintBBalance}</p>
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
                                    onclick={() => {
                                        isConfirmPositionModalOpen = true;
                                        calculateSwapAmounts();
                                        calculateAddLiquidityAmounts();
                                    }}
                                    disabled={isInvalid}
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