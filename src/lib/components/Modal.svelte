<script>
    let { children, close, isOpen = $bindable() } = $props();

    const closeModal = () => {
        isOpen = false;

        close()
    };
</script>

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed left-0 top-0 w-screen h-screen z-[100]">
        <div
            class="absolute w-screen h-screen bg-black/90"
            onclick={closeModal}
        ></div>
        <div class="flex items-center justify-center w-full h-full overflow-y-scroll z-[110]">
            {@render children()}
        </div>
    </div>
{/if}