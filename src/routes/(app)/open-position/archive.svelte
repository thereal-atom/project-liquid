<script lang="ts">
	import { getPoolQuote } from "$lib/api/pools";
	import { Transaction } from "@solana/web3.js";
	import { truncateString } from "$lib/utils/core";
	import { walletState } from "$lib/stores/wallet.svelte";
	import { getPhantomProvider } from "$lib/utils/phantom";
	import { openPositionPrepare } from "$lib/api/position.js";

    let { data } = $props();
    
    const { pool, raydiumPoolData } = data;

    let swapQuote = $state(data.swapQuote);
    let tokensQuote = $state(data.tokensQuote);
    let addLiquidityQuote = $state(data.addLiquidityQuote);

    let inputAmountA = $state(0);
    let maxAmountA = $derived(walletState.solBalance - 0.01);
    let amountB = $derived(inputAmountA * swapQuote.amountOut);
    let minimumAmountB = $derived(inputAmountA * swapQuote.minAmountOut);

    let usdValueA = $derived(inputAmountA * tokensQuote?.mintAPrice);
    let usdValueB = $derived(amountB * tokensQuote?.mintBPrice);

    let usdValueAddLiquidityA = $derived(inputAmountA * tokensQuote?.mintAPrice);
    let usdValueAddLiquidityB = $derived(inputAmountA * addLiquidityQuote.anotherAmount * tokensQuote?.mintBPrice);
    
    let isFetchingQuote = $state(false);
    let lastFetchedQuoteTimestamp = $state(Date.now());

    let isInsufficientBalance = $derived(inputAmountA > maxAmountA);

    let isLoading = $state(false);

    let swapErrorMessage = $state("");

    $effect(() => {
        if (inputAmountA > maxAmountA) {
            swapErrorMessage = "Insufficient Balance. Leave 0.01 SOL for fees.";
        } else {
            swapErrorMessage = "";
        };
    });

    const handleInputAmountAInput = async () => {
        if (isFetchingQuote || Date.now() - lastFetchedQuoteTimestamp < 5_000) {
            return;
        };

        try {
            isFetchingQuote = true;

            const quote = await getPoolQuote(pool.id, 1);

            swapQuote = quote.swapQuote;
            addLiquidityQuote = quote.addLiquidityQuote;

            lastFetchedQuoteTimestamp = Date.now();

            isFetchingQuote = false;
        } catch (err) {
            console.error(err);
        };
    };

    // setInterval(handleInputAmountAInput, 20_000);

    const handleSwap = async () => {
        try {
            isLoading = true;

            // const connection = initRpcConnection("126f686a-fe11-4859-bcb5-5cd78dd4a33b");
            // const raydium = await initRaydiumClient({ ownerPublicKey: "CwkbyUSgadcjaYbVmohPHxgYk7G6hnCLLno355njdE13" }, connection);

            // const poolData = await getRaydiumPoolData(raydium, pool.id);

            // const [baseReserve, quoteReserve, status] = [poolData.poolRpcData.baseReserve, poolData.poolRpcData.quoteReserve, poolData.poolRpcData.status.toNumber()];

            // const inputMint = poolData.mintIn.address;

            // const baseIn = inputMint === poolData.poolInfo.mintA.address
            // const [mintIn, mintOut] = baseIn ? [poolData.poolInfo.mintA, poolData.poolInfo.mintB] : [poolData.poolInfo.mintB, poolData.poolInfo.mintA]

            // const amountIn = inputAmountA  * 10 ** mintIn.decimals;

            // const out = raydium.liquidity.computeAmountOut({
            //     poolInfo: {
            //         ...poolData.poolInfo,
            //         baseReserve,
            //         quoteReserve,
            //         status,
            //         version: 4,
            //     },
            //     amountIn: new BN(amountIn),
            //     mintIn: mintIn.address,
            //     mintOut: mintOut.address,
            //     slippage: 0.01,
            // });

            // const { transaction } = await raydium.liquidity.swap({
            //     poolInfo: poolData.poolInfo,
            //     poolKeys: poolData.poolKeys,
            //     amountIn: new BN(amountIn),
            //     amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
            //     fixedSide: 'in',
            //     inputMint: mintIn.address,
            //     txVersion: TxVersion.V0,
            // });

            // const provider = getPhantomProvider();

            // const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
            // transaction.recentBlockhash = blockhash;

            // const { signature } = await provider.signAndSendTransaction(transaction);

            // console.log(signature);
            
            isLoading = false;
        } catch (error) {
            isLoading = false;

            console.error(error);
        };
    };

    const handleAddLiquidity = async () => {
        // limit to 10 SOL
        // TODO: set limit on backend
        if (inputAmountA <= 0 || isLoading || inputAmountA > maxAmountA || inputAmountA > 10) {
            return;
        };

        try {
            isLoading = true;

            const { transaction } = await openPositionPrepare({
                poolId: pool.id,
                amountSol: inputAmountA,
            });

            const addLiquidityTransactionBuffer = Buffer.from(transaction, "base64");
            const addLiquidityTransaction = Transaction.from(addLiquidityTransactionBuffer);

            const provider = getPhantomProvider();

            const { signature } = await provider.signAndSendTransaction(addLiquidityTransaction); 

            console.log(signature);

            // const quote = getRaydiumAddLiquidityQuote({
            //     amountSol: inputAmountA,
            //     poolData,
            // }, raydium);

            // const amountSol = inputAmountA;
            // const amountMeme = parseFloat(quote.maxAnotherAmount.toExact());
            // const minAmountMeme = parseFloat(quote.minAnotherAmount.toExact());

            // const { transaction } = await addRaydiumLiquidity({
            //     poolInfo: poolData.poolInfo,
            //     poolKeys: poolData.poolKeys,
            //     amountA: amountSol,
            //     amountB: amountMeme,
            //     minAmountB: minAmountMeme,
            //     mintA: poolData.mintIn,
            //     mintB: poolData.mintOut,
            // }, raydium);

            // const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
            // transaction.recentBlockhash = blockhash;

            // const provider = getPhantomProvider();

            // // const { signature } = await provider.signAndSendTransaction(transaction);

            // const signedTransaction = await provider.signTransaction(transaction);
            // const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            // console.log(signature);

            isLoading = false;
        } catch (error) {
            isLoading = false;

            console.error(error);
        };
    };
</script>

<div class="p-16">
    <h1 class="text-3xl font-bold">Open A Position</h1>
    <div class="flex flex-col items-center w-full mt-8">
        <div class="flex flex-row">
            <div class="flex flex-col w-[734px]">
                <div class="flex flex-row items-center">
                    <h2 class="text-xl font-semibold">Step 1: Swap</h2>
                    <img
                        src="/icons/info-circle.svg"
                        alt="info"
                        class="w-4 h-4 ml-2 mt-1"
                    />
                </div>
                <div class="flex flex-col mt-4">
                    <div class="flex flex-col bg-primary border border-secondary/20 p-6 rounded-md">
                        <div class="flex flex-row justify-between">
                            <p class="font-semibold">From</p>
                            <div class="flex flex-row items-center">
                                <img
                                    class="w-3 h-3 opacity-70"
                                    src="/icons/wallet.svg"
                                    alt="wallet"
                                />
                                <p class="ml-1 text-sm font-medium opacity-70">{walletState.solBalance} SOL</p>
                                <button
                                    class="ml-2 text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-[4px]"
                                    onclick={() => inputAmountA = walletState.solBalance - 0.01}
                                >
                                    Max
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-row items-center w-full mt-4 rounded-md">
                            <div class="flex flex-row items-center bg-indigo-400/20 px-4 py-2 rounded-md">
                                <div class="w-8 h-8 p-1 bg-white/20 rounded-full">
                                    <img
                                        class="w-6 min-w-6 h-6 rounded-full"
                                        src={pool.mintA.logoURI}
                                        alt={pool.mintA.symbol}
                                    />
                                </div>
                                <p class="font-bold ml-2">{pool.mintA.symbol}</p>
                            </div>
                            <input
                                class="w-full ml-4 py-3 font-semibold bg-transparent text-right"
                                type="text"
                                placeholder="0.00"
                                bind:value={inputAmountA}
                                oninput={handleInputAmountAInput}
                            />
                        </div>
                        <div class="flex flex-row justify-end w-full">
                            <p class="text-xs font-semibold opacity-20">~${usdValueA.toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="flex flex-col bg-primary border border-secondary/20 mt-4 p-6 rounded-md">
                        <div class="flex flex-row justify-between">
                            <p class="font-semibold">To</p>
                        </div>
                        <div class="flex flex-row items-center w-full mt-4 rounded-md">
                            <div class="flex flex-row items-center bg-indigo-400/20 px-4 py-2 rounded-md">
                                <div class="w-8 h-8 p-1 bg-white/20 rounded-full">
                                    <img
                                        class="w-6 min-w-6 h-6 rounded-full"
                                        src={pool.mintB.logoURI}
                                        alt={pool.mintB.symbol}
                                    />
                                </div>
                                <p class="font-bold ml-2">{pool.mintB.symbol}</p>
                            </div>
                            <div class="w-full ml-4 py-3 font-semibold bg-transparent text-right">
                                {#if amountB > 0}
                                    <p>{amountB.toFixed(3)}</p>
                                {:else}
                                    <p class="font-semibold opacity-20">0.00</p>
                                {/if}
                            </div>
                        </div>
                        <div class="flex flex-row justify-end w-full">
                            <p class="text-xs font-semibold opacity-20">~${usdValueB.toLocaleString()}</p>
                        </div>
                    </div>
                    <p class="mt-4 text-xs font-medium opacity-70"><span class="text-[10px] mr-1">Quote:</span>1 SOL≈{swapQuote.amountOut.toFixed(5)} {pool.mintB.symbol}</p>
                    <p class="flex flex-row mt-1 text-xs font-medium opacity-70"><span class="text-[10px] mr-1">Minimum Received:</span> {minimumAmountB.toFixed(5)} {pool.mintB.symbol}</p>
                    {#if swapErrorMessage}
                        <div class="w-full mt-2 py-3 bg-red-300/20 rounded-md">
                            <p class="text-sm text-red-400 text-center font-semibold">{swapErrorMessage}</p>
                        </div>
                    {/if}
                    <button
                        class="w-full mt-4 px-8 py-2.5 font-semibold bg-accent rounded-md disabled:opacity-50"
                        disabled={isLoading || swapErrorMessage !== ""}
                        onclick={handleSwap}
                    >
                        Swap
                    </button>
                </div>
            </div>
            <!-- <div class="flex flex-col w-[400px] ml-12">
                <div class="flex flex-row items-center">
                    <h2 class="text-xl font-semibold opacity-0">_</h2>
                </div>
                <div class="flex flex-col mt-4 p-6 bg-primary border border-secondary/20 rounded-md">
                    <div class="flex flex-col">
                        <p class="font-bold">Details</p>
                        <div class="flex flex-col mt-4">
                            <div class="flex flex-row items-center justify-between">
                                <p class="text-xs font-medium">{pool.mintA.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintA.address, 8, 8)}</p>
                                    <img
                                        src="/icons/copy.svg"
                                        alt="copy"
                                        class="w-4 h-4 ml-1"
                                    />
                                    <img
                                        src="/icons/link-external.svg"
                                        alt="link external"
                                        class="w-4 h-4 ml-1"
                                    />
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between mt-1.5">
                                <p class="text-xs font-medium">{pool.mintB.symbol}</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintB.address, 8, 8)}</p>
                                    <img
                                        src="/icons/copy.svg"
                                        alt="copy"
                                        class="w-4 h-4 ml-2"
                                    />
                                    <img
                                        src="/icons/link-external.svg"
                                        alt="link external"
                                        class="w-4 h-4 ml-1"
                                    />
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between mt-1.5">
                                <p class="text-xs font-medium">LP Mint</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-[10px] font-medium opacity-50">{truncateString(pool.lpMint.address, 8, 8)}</p>
                                    <img
                                        src="/icons/copy.svg"
                                        alt="copy"
                                        class="w-4 h-4 ml-2"
                                    />
                                    <img
                                        src="/icons/link-external.svg"
                                        alt="link external"
                                        class="w-4 h-4 ml-1"
                                    />
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between mt-1.5">
                                <p class="text-xs font-medium">Pool Id</p>
                                <div class="flex flex-row items-center">
                                    <p class="text-[10px] font-medium opacity-50">{truncateString(pool.id, 8, 8)}</p>
                                    <img
                                        src="/icons/copy.svg"
                                        alt="copy"
                                        class="w-4 h-4 ml-2"
                                    />
                                    <img
                                        src="/icons/link-external.svg"
                                        alt="link external"
                                        class="w-4 h-4 ml-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col mt-4">
                        <p class="font-bold">LP Pool</p>
                        <div class="flex flex-col mt-4">
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
                    <div class="flex flex-col mt-4">
                        <p class="font-bold">LP Stats</p>
                        <div class="flex flex-row items-center justify-between mt-4">
                            <div class="flex flex-row items-center">
                                <p class="text-xs font-medium">24hr APR</p>
                            </div>
                            <p class="text-xs font-medium">{pool.day.apr.toFixed(2)}%</p>
                        </div>
                        <div class="flex flex-row items-center justify-between mt-1.5">
                            <div class="flex flex-row items-center">
                                <p class="text-xs font-medium">24hr Fees</p>
                            </div>
                            <p class="text-xs font-medium">${(pool.day.volume * 0.0025).toLocaleString()}</p>
                        </div>
                        <div class="flex flex-row items-center justify-between mt-1.5">
                            <div class="flex flex-row items-center">
                                <p class="text-xs font-medium">24hr Volume</p>
                            </div>
                            <p class="text-xs font-medium">${pool.day.volume.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
            </div> -->
        </div>
        <div class="flex flex-col w-[734px] mt-32">
            <div class="flex flex-row items-center">
                <h2 class="text-xl font-semibold">Step 2: Add Liquidity</h2>
                <img
                    src="/icons/info-circle.svg"
                    alt="info"
                    class="w-4 h-4 ml-2 mt-1"
                />
            </div>
            <div class="flex flex-col">
                <div class="flex flex-col mt-4 bg-primary/50 border border-secondary/10 p-6 rounded-md">
                    <p class="font-bold">LP Pool</p>
                    <div class="flex flex-row items-center justify-between mt-2">
                        <p class="text-xs font-medium">LP Mint</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.lpMint.address, 8, 8)}</p>
                            <img
                                src="/icons/copy.svg"
                                alt="copy"
                                class="w-4 h-4 ml-2"
                            />
                            <img
                                src="/icons/link-external.svg"
                                alt="link external"
                                class="w-4 h-4 ml-1"
                            />
                        </div>
                    </div>
                    <div class="flex flex-row items-center justify-between mt-1.5">
                        <p class="text-xs font-medium">Pool Id</p>
                        <div class="flex flex-row items-center">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.id, 8, 8)}</p>
                            <img
                                src="/icons/copy.svg"
                                alt="copy"
                                class="w-4 h-4 ml-2"
                            />
                            <img
                                src="/icons/link-external.svg"
                                alt="link external"
                                class="w-4 h-4 ml-1"
                            />
                        </div>
                    </div>
                    <hr class="w-full h-[1px] my-4 bg-white/20 border-none" />
                    <div class="flex flex-col">
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
                <div class="flex flex-col mt-4 bg-primary border border-secondary/20 p-6 rounded-md">
                    <div class="flex flex-row justify-between">
                        <div class="flex flex-row mb-0.5">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintA.address, 8, 8)}</p>
                            <img
                                src="/icons/copy.svg"
                                alt="copy"
                                class="w-4 h-4 ml-1"
                            />
                            <img
                                src="/icons/link-external.svg"
                                alt="link external"
                                class="w-4 h-4 ml-1"
                            />
                        </div>
                        <div class="flex flex-row items-center">
                            <img
                                class="w-3 h-3 opacity-70"
                                src="/icons/wallet.svg"
                                alt="wallet"
                            />
                            <p class="ml-1 text-sm font-medium opacity-70">{walletState.solBalance} SOL</p>
                            <button
                                class="ml-2 text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-[4px]"
                                onclick={() => inputAmountA = walletState.solBalance - 0.01}
                            >
                                Max
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-row items-center w-full mt-4 rounded-md">
                        <div class="flex flex-row items-center bg-indigo-400/20 px-4 py-2 rounded-md">
                            <div class="w-8 h-8 p-1 bg-white/20 rounded-full">
                                <img
                                    class="w-6 min-w-6 h-6 rounded-full"
                                    src={pool.mintA.logoURI}
                                    alt={pool.mintA.symbol}
                                />
                            </div>
                            <p class="font-bold ml-2">{pool.mintA.symbol}</p>
                        </div>
                        <input
                            class="w-full ml-4 py-3 font-semibold bg-transparent text-right"
                            type="text"
                            placeholder="0.00"
                            bind:value={inputAmountA}
                            oninput={handleInputAmountAInput}
                        />
                    </div>
                    <div class="flex flex-row justify-end w-full">
                        <p class="text-xs font-semibold opacity-20">~${usdValueAddLiquidityA.toLocaleString()}</p>
                    </div>
                </div>
                <div class="flex flex-col p-6 mt-4 bg-primary border border-secondary/20 rounded-md">
                    <div class="flex flex-row justify-between">
                        <div class="flex flex-row mb-0.5">
                            <p class="text-[10px] font-medium opacity-50">{truncateString(pool.mintB.address, 8, 8)}</p>
                            <img
                                src="/icons/copy.svg"
                                alt="copy"
                                class="w-4 h-4 ml-1"
                            />
                            <img
                                src="/icons/link-external.svg"
                                alt="link external"
                                class="w-4 h-4 ml-1"
                            />
                        </div>
                        <div class="flex flex-row items-center">
                            <img
                                class="w-3 h-3 opacity-70"
                                src="/icons/wallet.svg"
                                alt="wallet"
                            />
                            <p class="ml-1 text-sm font-medium opacity-70">{0} {pool.mintB.symbol}</p>
                            <button
                                class="ml-2 text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-[4px]"
                                onclick={() => inputAmountA = walletState.solBalance - 0.01}
                            >
                                Max
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-row items-center w-full mt-4 rounded-md">
                        <div class="flex flex-row items-center bg-indigo-400/20 px-4 py-2 rounded-md">
                            <div class="w-8 h-8 p-1 bg-white/20 rounded-full">
                                <img
                                    class="w-6 min-w-6 h-6 rounded-full"
                                    src={pool.mintB.logoURI}
                                    alt={pool.mintB.symbol}
                                />
                            </div>
                            <p class="font-bold ml-2">{pool.mintB.symbol}</p>
                        </div>
                        <input
                            class="w-full ml-4 py-3 font-semibold bg-transparent text-right"
                            type="text"
                            placeholder="0.00"
                            value={amountB}
                        />
                    </div>
                    <div class="flex flex-row justify-end w-full">
                        <p class="text-xs font-semibold opacity-20">~${usdValueAddLiquidityB.toLocaleString()}</p>
                    </div>
                </div>
                <div class="flex flex-col mt-4 bg-primary/50 border border-secondary/10 p-6 rounded-md">
                    <div class="flex flex-row justify-between">
                        <p class="font-semibold">Total Deposit</p>
                        <p class="font-semibold">${(usdValueAddLiquidityA + usdValueAddLiquidityB).toLocaleString()}</p>
                    </div>
                </div>
                <button
                    class="w-full mt-4 px-8 py-2.5 font-semibold bg-accent rounded-md disabled:opacity-50"
                    disabled={isLoading || isInsufficientBalance}
                    onclick={handleAddLiquidity}
                >
                    Deposit
                </button>
            </div>
        </div>
    </div>
</div>