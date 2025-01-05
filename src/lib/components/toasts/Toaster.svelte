<script lang="ts">
	import { getToasterState } from "$lib/context/toaster.svelte";
	import Toast from "./Toast.svelte";

	const toaster = getToasterState();
</script>

<div class="absolute right-2 bottom-2 flex flex-col gap-2 z-[110]">
	{#each toaster.toasts as toast}
		<Toast {toast} />
	{/each}
</div>