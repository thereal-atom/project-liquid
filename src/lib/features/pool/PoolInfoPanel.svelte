<script lang="ts">
	import { copy } from "$lib/actions/copy.svelte";
	import { truncateString } from "$lib/utils/common";
	import type { ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";

    type Props = {
        pool: ApiV3PoolInfoStandardItem;
    };
    const { pool }: Props = $props();
</script>

<div class="flex flex-col">
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