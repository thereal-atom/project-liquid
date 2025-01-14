<script lang="ts">
	import { onMount } from "svelte";

	import type { AmmRpcData, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
	
    import { getAppState } from "$lib/context/app.svelte";
    
    import WalletConnectedButton from "$lib/components/WalletConnectedButton.svelte";
	
    import { getRaydiumAddLiquidityQuote } from "$lib/utils/raydium";
	import { getMintSymbol } from "$lib/utils/solana";
    
    const app = getAppState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        uiAmountMintA: number;
    };
    const { pool, poolRpcData, uiAmountMintA }: Props = $props();
    
    onMount(() => { calculateAddLiquidityAmounts() });
    
    $effect(() => {
        if (poolRpcData) {
            calculateAddLiquidityAmounts();
        };
    });

    let isLoading = $state(false);

    let uiShortAmountA = $state(0);
    let uiShortAmountB = $state(0);

    const calculateAddLiquidityAmounts = () => {
        if (!app.raydiumClient || !poolRpcData) return;

        const quote = getRaydiumAddLiquidityQuote(app.raydiumClient, {
            poolInfo: pool,
            baseIn: true,
            uiAmountIn: uiAmountMintA,
        });

        uiShortAmountA = -1 * uiAmountMintA;
        uiShortAmountB = -1 * parseFloat(quote.anotherAmount.toExact()) / 10 ** pool.mintA.decimals;
    };

    const handleConfirmOpenShort = () => {
        app.initOxClient({
            apiKey: "EXIRa+QJNVraoV1aodJV1BGQHbGBP8MHYYMFDhZfrZs=",
            apiSecret: "0yC9XDVymMJzPOTOihxRkvL7cSFiWnHNtX0DZNU33sU=",
        });

        if (!app.oxClient) return;

        isLoading = true;

        // app.oxClient.getBalances().then(console.log);
        app.oxClient.createSubAccount(`pl-CwkbyUSgadcjaYbVmohPHxgYk7G6hnCLLno355njdE13-solalch`).then(console.log);
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
            <p class="ml-1 font-semibold">Step 3: Open shorts</p>
        </div>
        <!-- todo: this will be better in a tooltip -->
        <!-- <p class="mt-1 text-xs font-medium text-gray-500">Open shorts against the tokens that you're depositing to hedge again impermanent loss and make pure profit with zero risk. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p> -->
        <div class="flex flex-col mt-4">
            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                <div class="flex flex-row items-center justify-between w-full">
                    <p class="font-bold">{uiShortAmountA.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
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
                    <p class="font-bold">{uiShortAmountB.toLocaleString(undefined, { minimumSignificantDigits: 6 })}</p>
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
            className="mt-4 py-3 bg-accent text-sm font-semibold rounded-md"
            isDisabled={isLoading}
            onClick={handleConfirmOpenShort}
        >
            Open Shorts
        </WalletConnectedButton>
    </div>
</div>