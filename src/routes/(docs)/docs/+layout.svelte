<script lang="ts">
	let { children } = $props();
</script>

<div class="flex flex-row w-screen">
    <div class="w-[220px] h-screen bg-primary">
        <p>hello world</p>
    </div>
    {@render children()}
</div>