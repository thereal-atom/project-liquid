<script lang="ts">
    import "../app.css";
	import "$lib/styles/global.css";
    
	import { onMount } from "svelte";

    import { PublicKey } from "@solana/web3.js";

    import Toaster from "$lib/components/toasts/Toaster.svelte";

    import { getAppState, setAppState } from "$lib/context/app.svelte";
	import { getWalletState, setWalletState } from "$lib/context/wallet.svelte";
	import { getToasterState, setToasterState } from "$lib/context/toaster.svelte";

    import { getPhantomProvider } from "$lib/utils/phantom";

    setWalletState();
    setAppState();
    setToasterState();

    const wallet = getWalletState();
    const app = getAppState();
    const toaster = getToasterState();

	let { children } = $props();

    let phantomProvider: any = $state(undefined);

    onMount(async () => {
        if (app.connection) {
            app.initRaydiumClient({ connection: app.connection });
        };
        
        if (window.phantom) {
            phantomProvider = getPhantomProvider();

            phantomProvider.on("connect", async (pubKey: PublicKey) => {
                const pubKeyString = pubKey.toString();
                if (!pubKeyString) {
                    return;
                };

                wallet.pubKeyString = pubKeyString;

                toaster.add({
                    title: "Wallet Connected",
                    message: `Wallet: ${pubKeyString}`,
                    type: "success",
                });

                if (!app.connection) return;
                await app.initRaydiumClient({
                    owner: pubKey,
                    connection: app.connection,
                });
            });

            phantomProvider.on("disconnect", () => {
                console.log("Wallet Disconnected");
                
                wallet.reset();
            });

            try {
                await phantomProvider.connect({ onlyIfTrusted: true });
            } catch (err) {
                console.error(err);
            };
        };
    });
</script>

<Toaster />

<div class="w-screen max-w-screen">
    {@render children()}
</div>