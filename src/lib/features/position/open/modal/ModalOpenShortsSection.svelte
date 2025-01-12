<script lang="ts">
	import { getAppState } from "$lib/context/app.svelte";
	import type { AmmRpcData, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
    
    const app = getAppState();

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        tokenBalances: Record<string, number>;
    };
    const { pool, poolRpcData }: Props = $props();

    // const handleConfirmOpenShorts = async () => {};

    // // correct name? isInvalid means is the position unable to be opened for reasons like not enough balance
    // let isInvalid = $derived(
    //     isLoading ||
    //     amountMintA > mintABalance ||
    //     amountMintB > mintBBalance ||
    //     depositAmount <= 0
    // );
</script>

<p>open short section</p>

<p class="mt-1 text-xs font-medium text-gray-500">Open shorts against the tokens that you're depositing to hedge again impermanent loss and make pure profit with zero risk. <a href="/docs/open-position#swap" class="text-accent">Learn More</a></p>