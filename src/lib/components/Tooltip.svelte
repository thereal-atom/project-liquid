<script lang="ts">
    // type Props = {
    //     children: any;
    //     text: string;
    //     position?: "top" | "bottom" | "left" | "right";
    // };
    let { children } = $props();

    const position = "top";
    const text = "test";

    let showTooltip = $state(false);
  
    const toggleTooltip = () => {
        showTooltip = !showTooltip;
    };
</script>
  
<div
    class="tooltip-container"
    onmouseenter={toggleTooltip}
    onmouseleave={toggleTooltip}
    role="tooltip"
    tabindex="-1"
>
    {@render children?.()}

    <div
        class="tooltip {showTooltip ? 'show' : ''}"
        style="top: {position === 'top' ? '-100%' : position === 'bottom' ? '100%' : '50%'}; 
        left: {position === 'left' ? '-100%' : position === 'right' ? '100%' : '50%'};"
        aria-hidden={!showTooltip}
    >
        {text}
    </div>
</div>


<style>
    .tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 0.5em;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 1000;
        transition: opacity 0.2s;
        opacity: 0;
    }

    .tooltip.show {
        opacity: 1;
    }

    .tooltip-container {
        position: relative;
        display: inline-block;
    }
</style>