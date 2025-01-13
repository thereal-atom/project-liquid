<script lang="ts">
	import { getMintSymbol } from "$lib/utils/solana";
	import type { ApiV3Token } from "@raydium-io/raydium-sdk-v2";

    type Props = {
        mint: ApiV3Token;
        amount: number | undefined;
        price: number;
        balance: number;
        onInput: (amount: number) => void;
    };
    let { mint, amount = $bindable(), price, balance, onInput }: Props = $props();

    const handleInput = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;

        // remove non-numeric characters
        const parsedValue = value.replace(/[^0-9.]/g, "");
        const amount = parseFloat(parsedValue);

        onInput(amount);
    };
</script>

<div class="flex flex-col">
    <div class="flex flex-row items-center">
        <img
            class="w-4 h-4 opacity-50"
            src="/icons/wallet.svg"
            alt="wallet"
        />
        <p class="ml-1 mt-[2px] text-xs font-medium opacity-50">{balance}</p>
    </div>
    <div class="flex flex-row p-6 mt-2 bg-[#0C0910] rounded-md border border-secondary/0 focus-within:border-secondary/80">
        <div class="flex flex-row items-center w-fit">
            <div class="w-10 h-10 p-1 bg-white/20 rounded-full">
                <img
                    class="w-8 min-w-8 h-8 rounded-full"
                    src={mint.logoURI}
                    alt={getMintSymbol(mint)}
                />
            </div>
            <p class="ml-2 text-xl font-semibold">{getMintSymbol(mint)}</p>
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="flex flex-col items-end w-full hover:cursor-text"
            onclick={() => {
                const tokenInputElement = document.getElementById(`token-input-${mint.address.slice(0, 5)}`);
                if (!tokenInputElement) return;

                tokenInputElement.focus();
            }}
        >
            <input
                class="bg-inherit font-semibold text-xl text-right outline-none"
                id="token-input-{mint.address.slice(0, 5)}"
                type="decimal"
                bind:value={amount}
                oninput={handleInput}
            />
            <p class="mt-1 text-xs font-medium opacity-50">~${((amount || 0) * price).toLocaleString()}</p>
        </div>
    </div>
</div>