<script>
    import { getWalletState } from "$lib/context/wallet.svelte";

    const wallet = getWalletState();
</script>

<div class="p-12">
    <p>Home Page</p>
    <a class="text-accent font-semibold mt-4" href="/open-position?poolId=FyDF3vKQFbcvNTsBi7L7LremrFPmXKbQqgAgnPg1hXXd">Alch</a>
    <p>Wallet Key: {wallet.pubKeyString}</p>
    <h1 class="text-xl font-bold my-4">Ox</h1>
    <p>Ox API Key: {wallet.getOxSettings().apiKey || "Not Set"}</p>
    <form
        class="flex flex-col w-[500px] mt-4"
        on:submit|preventDefault={(e) => {
            const formData = new FormData(e.currentTarget);

            const data = { apiKey: formData.get("ox-api-key")?.toString() || "" };

            wallet.setOxSettings({
                apiKey: data.apiKey,
            });
        }}
    >
        <label for="ox-api-key">Ox API Key</label>
        <input class="p-2 bg-inherit border border-secondary/20 rounded-md" type="text" id="ox-api-key" name="ox-api-key" required />
        <button class="mt-2 py-2 bg-accent font-semibold rounded-md" type="submit">Save</button>
    </form>
</div>