<script lang="ts">
	import type { ApiV3PoolInfoStandardItem, AmmRpcData, AmmV4Keys, AmmV5Keys } from "@raydium-io/raydium-sdk-v2";

	import Modal from "$lib/components/Modal.svelte";
	import SwapSection from "./ModalSwapSection.svelte";
    import AddLiquiditySection from "./ModalAddLiquiditySection.svelte";
    import OpenShortsSection from "./ModalOpenShortsSection.svelte";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
        poolRpcData: AmmRpcData;
        poolKeys: AmmV4Keys | AmmV5Keys;
        tokenBalances: Record<string, number>;
        uiAmountIn: number;
        isOpen: boolean;
    };
    let { pool, poolRpcData, poolKeys, tokenBalances, uiAmountIn, isOpen }: Props = $props();

    let confirmPositionModalTabs = $state({
        activeTabIndex: 0,
        tabs: [
            { label: "Step 1: Swap" },
            { label: "Step 2: Add Liquidity" },
            { label: "Step 3: Open Shorts" },
        ],
    });

    // todo: bug fix - if you open the modal and then close it, the modal will not open again
</script>

<Modal
    bind:isOpen={isOpen}
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
                <SwapSection
                    {pool}
                    {poolRpcData}
                    {poolKeys}
                    {tokenBalances}
                    {uiAmountIn}
                />
            {:else if confirmPositionModalTabs.activeTabIndex === 1}
                <AddLiquiditySection
                    {pool}
                    {poolRpcData}
                    {tokenBalances}
                />
            {:else if confirmPositionModalTabs.activeTabIndex === 2}
                <OpenShortsSection
                    {pool}
                    {poolRpcData}
                    {tokenBalances}
                />
            {/if}
        </div>
    </div>
</Modal>