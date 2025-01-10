


    <!-- todo: put into separate component -->
    <Modal
        bind:isOpen={isConfirmPositionModalOpen}
        close={() => isConfirmPositionModalOpen = false}
    >
        <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col w-[600px] h-[600px] p-8 bg-[#0C0910] border border-secondary/20 rounded-md z-20">
            <p class="text-xl font-bold">Confirm Position</p>
            <div class="flex flex-row my-4 bg-primary/50 border border-secondary/10 rounded-md">
                {#each confirmPositionModalTabs.tabs as tab, i}
                    <button
                        class="w-1/3 py-3 text-sm text-center font-semibold {i !== 0 ? "border-l border-secondary/10" : ""} {confirmPositionModalTabs.activeTabIndex === i ? "bg-secondary/20" : "bg-primary/50"} {i === 0 ? "rounded-l-md" : ""} {i === confirmPositionModalTabs.tabs.length - 1 ? "rounded-r-md" : ""}"
                        onclick={() => confirmPositionModalTabs.activeTabIndex = i}
                    >
                        {tab.label}
                    </button>
                {/each}
            </div>
            <div class="flex flex-col h-full mt-8">
                {#if confirmPositionModalTabs.activeTabIndex === 0}
                    <p class="font-semibold">Step 1: Swap</p>
                    <!-- tooltip: you need to deposit sol and the the token into the liquidity pool. swap now to ensure you have enough. -->
                    <div class="flex flex-col mt-4">
                        {#if isLoadingSwapQuote}
                            <p class="my-4 font-semibold">Loading swap quote...</p>
                        {:else}
                            <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                                <div class="flex flex-row items-center justify-between w-full">
                                    <p class="font-bold">{swapAmountA}</p>
                                    <div class="flex flex-row items-center">
                                        <p class="font-semibold">{pool.mintA.symbol}</p>
                                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                            <img
                                                class="w-6 min-w-6 h-6 rounded-full"
                                                src={pool.mintA.logoURI}
                                                alt={pool.mintA.symbol}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <img src="/icons/down-arrow.svg" alt="down-arrow" class="w-6 h-6 my-4" />
                                <div class="flex flex-row items-center justify-between w-full">
                                    <p class="font-bold">{swapAmountB}</p>
                                    <div class="flex flex-row items-center">
                                        <p class="font-semibold">{pool.mintB.symbol}</p>
                                        <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                            <img
                                                class="w-6 min-w-6 h-6 rounded-full"
                                                src={pool.mintB.logoURI}
                                                alt={pool.mintB.symbol}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                class="mt-4 py-3 bg-accent text-sm font-semibold rounded-md"
                                disabled={isInvalid}
                                onclick={handleConfirmSwap}
                            >
                                Confirm Swap
                            </button>
                        {/if}
                        <button
                            class="mt-4 py-3 bg-primary text-sm font-semibold rounded-md border border-secondary/10"
                            disabled={isLoading}
                            onclick={() => confirmPositionModalTabs.activeTabIndex += 1}
                        >
                            Skip Swap
                        </button>
                    </div>
                {:else if confirmPositionModalTabs.activeTabIndex === 1}
                    <p class="font-semibold">Step 2: Add Liquidity</p>
                    <!-- tooltip: deposit the tokens into the liquidity pool to start earning fees. -->
                    <div class="flex flex-col mt-4">
                        <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                            <div class="flex flex-row items-center justify-between w-full">
                                <p class="font-bold">{addLiquidityAmountA.toLocaleString()}</p>
                                <div class="flex flex-row items-center">
                                    <p class="font-semibold">{pool.mintA.symbol}</p>
                                    <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-6 min-w-6 h-6 rounded-full"
                                            src={pool.mintA.logoURI}
                                            alt={pool.mintA.symbol}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between w-full mt-4">
                                <p class="font-bold">{addLiquidityAmountB.toLocaleString()}</p>
                                <div class="flex flex-row items-center">
                                    <p class="font-semibold">{pool.mintB.symbol}</p>
                                    <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-6 min-w-6 h-6 rounded-full"
                                            src={pool.mintB.logoURI}
                                            alt={pool.mintB.symbol}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            class="mt-4 py-3 bg-accent text-sm font-semibold rounded-md"
                            disabled={isInvalid}
                            onclick={handleConfirmAddLiquidity}
                        >
                            Confirm Add Liquidity
                        </button>
                    </div>
                {:else if confirmPositionModalTabs.activeTabIndex === 2}
                    <p class="font-semibold">Step 3: Open Shorts</p>
                    <!-- tooltip: open short positions to hedge against asset value loss. [learn more](link-to-learn-more) about hedging against asset value loss. -->
                    <div class="flex flex-col mt-4">
                        <div class="flex flex-col items-center w-full p-4 bg-primary rounded-md border border-secondary/20">
                            <div class="flex flex-row items-center justify-between w-full">
                                <p class="font-bold">-1.00001</p>
                                <div class="flex flex-row items-center">
                                    <p class="font-semibold">{pool.mintA.symbol}</p>
                                    <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-6 min-w-6 h-6 rounded-full"
                                            src={pool.mintA.logoURI}
                                            alt={pool.mintA.symbol}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-row items-center justify-between w-full mt-4">
                                <p class="font-bold">-2,500.00001</p>
                                <div class="flex flex-row items-center">
                                    <p class="font-semibold">{pool.mintB.symbol}</p>
                                    <div class="w-8 h-8 ml-2 p-1 bg-white/20 rounded-full">
                                        <img
                                            class="w-6 min-w-6 h-6 rounded-full"
                                            src={pool.mintB.logoURI}
                                            alt={pool.mintB.symbol}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            class="mt-4 py-3 bg-accent text-sm font-semibold rounded-md"
                            disabled={isInvalid}
                            onclick={handleConfirmOpenShorts}
                        >
                            Confirm Open Shorts
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </Modal>