<script lang="ts">
	import type { Snippet } from "svelte";
    
	import { getToasterState } from "$lib/context/toaster.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";

	import { connectPhantomWallet } from "$lib/utils/phantom";

    const wallet = getWalletState();
    const toaster = getToasterState();

    type Props = {
        children: Snippet;
        className: string;
        isDisabled?: boolean;
        disabledText?: (string | undefined | boolean)[];
        onClick?: (e: MouseEvent & {
            currentTarget: EventTarget & HTMLButtonElement;
        }) => any;
    };
    let { children, className, isDisabled, disabledText, onClick }: Props = $props();

    let isLoading = $state(false);
    let isWalletConnected = $derived(wallet.pubKeyString !== null);

    const handleConnectPhantomWallet = async () => {
        isLoading = true;

        try {
            await connectPhantomWallet();

            isLoading = false;
        } catch (err: any) {
            console.error(err);

            toaster.add({
                title: "Error Connecting Wallet",
                message: err.message,
                type: "error",
            });

            isLoading = false;
        };
    };
</script>

<button
    class={className}
    disabled={(isWalletConnected ? isDisabled : false) || isLoading}
    onclick={(e) => {
        e.preventDefault();
        
        if (isWalletConnected) {
            if (!onClick) return;

            return onClick(e);
        };

        handleConnectPhantomWallet();
    }}
>
    {#if !wallet.pubKeyString}
        Connect Wallet
    {:else}
        {#if isDisabled}
            {#if disabledText && disabledText?.filter(text => text).length > 0}
                {disabledText.filter(text => text)[0]}
            {:else}
                {@render children?.()}
            {/if}
        {:else}
            {@render children?.()}
        {/if}
    {/if}
</button>