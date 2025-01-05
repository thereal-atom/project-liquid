<script lang="ts">
	import type { Toast } from "$lib/types/toasts";
	import { getToasterState } from "$lib/context/toaster.svelte";
	import { fly } from "svelte/transition";

    interface Props {
        toast: Toast;
    };

    const { toast }: Props = $props();
    const toaster = getToasterState();

    const mapTypeToColor = (type: string) => {
        switch (type) {
            case "error":
                return "red";
            case "success":
                return "green";
            case "info":
                return "blue";
            case "warning":
                return "orange";
            default:
                return "gray";
        };
    };
</script>

<div
	class="relative flex flex-row items-center w-[400px] h-auto mb-8 p-4 bg-{mapTypeToColor(toast.type)}-900 border border-{mapTypeToColor(toast.type)}-500 rounded-md shadow-md"
    in:fly={{ x: 200, duration: 300 }}
    out:fly={{ x: -200, duration: 300 }}
>
    <div class="flex flex-col w-full ml-4">
        <p class="text-xl font-bold text-{mapTypeToColor(toast.type)}-400">{toast.title}</p>
        {#if toast.message}
            <p class="font-medium">{toast.message}</p>
        {/if}
    </div>
    <button
        class="flex items-center justify-center h-full"
        onclick={() => toaster.remove(toast.id)}
    >
        <img
            class="w-10 h-8"
            src="/icons/x.svg"
            alt="x"
        />
    </button>
</div>