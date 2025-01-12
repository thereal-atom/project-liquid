<script lang="ts">
	import { getToasterState } from "$lib/context/toaster.svelte";
	import { getWalletState } from "$lib/context/wallet.svelte";
	import { getPhantomProvider } from "$lib/utils/phantom";

	let { children } = $props();

    const wallet = getWalletState();
    const toaster = getToasterState();

    let isLoading = $state(false);

    const handleConnectPhantomWallet = async () => {
        const phantomProvider = getPhantomProvider();
        if (!phantomProvider) {
            toaster.add({
                title: "Error Connecting Wallet",
                message: "Phantom Wallet not found.",
                type: "error",
            });

            return;
        };

        isLoading = true;

        try {
            await phantomProvider.connect();

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

    const handleDisconnectPhantomWallet = async () => {
        const phantomProvider = getPhantomProvider();
        if (!phantomProvider) return;

        isLoading = true;

        try {
            await phantomProvider.disconnect();

            isLoading = false;
        } catch (err: any) {
            console.error(err);

            toaster.add({
                title: "Error Disconnecting Wallet",
                message: err.message,
                type: "error",
            });

            isLoading = false;
        };
    };
</script>

<div class="flex flex-col w-screen max-w-screen">
    <div class="flex flex-row items-center justify-between p-12 bg-primary">
        <div class="flex flex-row">
            <a
                class="font-bold text-xl"
                href="/"
            >
                Home
            </a>
            <a
                class="ml-8 font-bold text-xl"
                href="/pools"
            >
                Pools
            </a>
            <a
                class="ml-8 font-bold text-xl"
                href="/portfolio"
            >
                Portfolio
            </a>
            <a
                class="ml-8 font-bold text-xl"
                href="/calculator"
            >
                Calculator
            </a>
        </div>
        <div class="flex flex-row">
            {#if wallet.pubKeyString !== null}
                <p class="h-fit px-4 py-2 font-semibold rounded-md">
                    {wallet.pubKeyString.substring(0, 4)}...{wallet.pubKeyString.substring(wallet.pubKeyString.length - 4)}
                </p>
                <button
                    class="ml-4 px-4 py-2 bg-indigo-500 font-semibold rounded-md"
                    onclick={handleDisconnectPhantomWallet}
                    disabled={isLoading}
                >
                    Disconnect
                </button>
            {:else}
                <button
                    class="px-4 py-2 bg-indigo-500 font-semibold rounded-md"
                    onclick={handleConnectPhantomWallet}
                    disabled={isLoading}
                >
                    Connect Phantom
                </button>
            {/if}
        </div>
    </div>
    {@render children()}
</div>