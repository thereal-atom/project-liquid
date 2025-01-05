<script>
    const nameTokenA = "SOL";
    const initialAmountTokenA = 10;
    const initialPriceTokenA = 100;

    $: amountTokenA = initialAmountTokenA;
    $: priceTokenA = initialPriceTokenA;
    
    const nameTokenB = "ETH";
    const initialAmountTokenB = 1000;
    const initialPriceTokenB = 1;

    const ratio = initialAmountTokenA * initialAmountTokenB;

    $: amountTokenB = initialAmountTokenB;
    $: priceTokenB = initialPriceTokenB;

    const setNewPrice = () => {
        priceTokenB /= 2;
        
        // price of b in terms of a
        const _ = priceTokenA / priceTokenB;

        const x = Math.sqrt(ratio / _);
        const y = ratio / x;

        // const __ = ;

        amountTokenA = x;
        amountTokenB = y;
    };

    $: setNewPrice();

    const step = 0.1;
    $: numberShortOrders = ((initialPriceTokenB - priceTokenB) || 0) / step;

    $: shortPositions = Array(numberShortOrders)
        .fill(0)
        .map((_, i) => {
            const exitPrice = initialPriceTokenB - step * (i + 1);
            const entryPrice = exitPrice + step;
            const amount = ratio / Math.sqrt(ratio / (priceTokenA / entryPrice));

            return {
                amount,
                entryPrice,
                exitPrice,
                pnl: amount * entryPrice - amount * exitPrice,
            };
        });
</script>

<div class="flex flex-col p-16">
    <h1 class="text-3xl font-bold">Calculator</h1>
    <button
        class="w-fit mt-4 px-4 py-2 font-medium text-black bg-white rounded-md"
        on:click={setNewPrice}
    >
        Set New Price
    </button>
    <div class="flex flex-col mt-4">
        <!-- <div class="flex flex-row">
            <div class="flex flex-col">
                <p>Token A: {nameTokenA}</p>
                <p>Initial Amount: {initialAmountTokenA}</p>
                <p>Initial Price: ${initialPriceTokenA}</p>
                <p>Initial Value: ${(initialAmountTokenA * initialPriceTokenA).toLocaleString()}</p>
            </div>
            <div class="flex flex-col ml-16">
                <p>Token B: {nameTokenB}</p>
                <p>Initial Amount: {initialAmountTokenB}</p>
                <p>Initial Price: ${initialPriceTokenB}</p>
                <p>Initial Value: ${(initialAmountTokenB * initialPriceTokenB).toLocaleString()}</p>
            </div>
        </div> -->
        <div class="flex flex-row mt-4">
            <div class="flex flex-col">
                <p>Pooled Value: ${(amountTokenA * priceTokenA + amountTokenB * priceTokenB).toLocaleString()}</p>
                <p>Pooled {nameTokenA} (A): {amountTokenA.toFixed(2)}</p>
                <p>Pooled {nameTokenB} (B): {amountTokenB.toFixed(2)}</p>
                <p>Constant (K): {(amountTokenA * amountTokenB).toFixed(2)}</p>
                <p>Price of {nameTokenA} in terms of {nameTokenB}: {(amountTokenB / amountTokenA).toFixed(2)} ({nameTokenB} / {nameTokenA})</p>
                <p>Price of {nameTokenB} in terms of {nameTokenA}: {(amountTokenA / amountTokenB).toFixed(2)} ({nameTokenA} / {nameTokenB})</p>
            </div>
            <div class="flex flex-col ml-16">
                <p>New Price {nameTokenA}: ${priceTokenA.toFixed(2)}</p>
                <p>New Price {nameTokenB}: ${priceTokenB.toFixed(2)}</p>
                <!-- <p>New Value {nameTokenA}: ${priceTokenA * amountTokenA}</p>
                <p>New Value {nameTokenB}: ${priceTokenB * amountTokenB}</p>
                <p>Value if HODL {nameTokenA}: ${priceTokenA * initialAmountTokenA}</p>
                <p>Value if HODL {nameTokenB}: ${priceTokenB * initialAmountTokenB}</p> -->
                <p>Asset X: {amountTokenA} * ${priceTokenA} = ${amountTokenA * priceTokenA}</p>
                <p>Asset Y: {amountTokenB} * ${priceTokenB} = ${amountTokenB * priceTokenB}</p>
                <p>If held in wallet instead:</p>
                <p>Asset X: {initialAmountTokenA} * ${priceTokenA} = ${initialAmountTokenA * priceTokenA}</p>
                <p>Asset Y: {initialAmountTokenB} * ${priceTokenB} = ${initialAmountTokenB * priceTokenB}</p>
                <p>Overall PNL: <span class="text-green-400">${(amountTokenA * priceTokenA + amountTokenB * priceTokenB) - (initialAmountTokenA * initialPriceTokenA + initialAmountTokenA * initialPriceTokenA)}</span></p>
                <p>PNL if held: <span class="text-green-400">${(initialAmountTokenA * priceTokenA + initialAmountTokenB * priceTokenB) - (initialAmountTokenA * initialPriceTokenA + initialAmountTokenA * initialPriceTokenA)}</span></p>
                <p>Impermanent Loss: <span class="text-red-400">-${(initialAmountTokenA * priceTokenA + initialAmountTokenB * priceTokenB) - amountTokenA * priceTokenA - amountTokenA * priceTokenA}</span></p>
                <!-- <p>PNL with short: ${(amountTokenA * initialPriceTokenA - amountTokenA * priceTokenA) + (amountTokenB * initialPriceTokenB - amountTokenB * priceTokenB)}</p> -->
                <!-- <p>Initial Short Position: ${-initialAmountTokenB * initialPriceTokenB}</p>
                <p>Final Short Position: ${-initialAmountTokenB * priceTokenB}</p> -->
            </div>
        </div>
        <!-- <div class="flex flex-col mt-4">
            <p>Asset Values</p>
            <table class="pools-table w-1/2 mt-4 text-left rtl:text-right border border-white/20">
                <thead class="text-xs bg-[#101010]">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Entry Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Exit Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            PnL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {amountTokenA} {nameTokenA}
                        </th>
                        <td class="px-6 py-4">
                            ${initialPriceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${priceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${amountTokenA * priceTokenA - initialAmountTokenA * initialPriceTokenA}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {amountTokenB} {nameTokenB}
                        </th>
                        <td class="px-6 py-4">
                            ${initialPriceTokenB}
                        </td>
                        <td class="px-6 py-4">
                            ${priceTokenB}
                        </td>
                        <td class="px-6 py-4">
                            ${amountTokenB * priceTokenB - initialAmountTokenB * initialPriceTokenB}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div> -->
        <!-- <div class="flex flex-col mt-4">
            <p>Asset Values if Held</p>
            <table class="pools-table w-1/2 mt-4 text-left rtl:text-right border border-white/20">
                <thead class="text-xs bg-[#101010]">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Entry Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Exit Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            PnL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {initialAmountTokenA} {nameTokenA}
                        </th>
                        <td class="px-6 py-4">
                            ${initialPriceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${priceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${initialAmountTokenA * priceTokenA - initialAmountTokenA * initialPriceTokenA}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {initialAmountTokenB} {nameTokenB}
                        </th>
                        <td class="px-6 py-4">
                            ${initialPriceTokenB}
                        </td>
                        <td class="px-6 py-4">
                            ${priceTokenB}
                        </td>
                        <td class="px-6 py-4">
                            ${initialAmountTokenB * priceTokenB - initialAmountTokenB * initialPriceTokenB}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div> -->
        <div class="flex flex-col mt-4">
            <p>ETH Short Positions</p>
            <table class="pools-table w-1/2 mt-4 text-left rtl:text-right border border-white/20">
                <thead class="text-xs bg-[#101010]">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Entry Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Exit Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            PnL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each shortPositions as position}
                        <tr>
                            <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {position.amount.toFixed(2)} {nameTokenB}
                            </th>
                            <td class="px-6 py-4">
                                ${position.entryPrice.toFixed(2)}
                            </td>
                            <td class="px-6 py-4">
                                ${position.exitPrice.toFixed(2)}
                            </td>
                            <td class="px-6 py-4">
                                ${position.pnl.toFixed(2)}
                            </td>
                        </tr>
                    {/each}
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            Total {nameTokenB}
                        </th>
                        <td class="px-6 py-4">
                            0
                        </td>
                        <td class="px-6 py-4">
                            0
                        </td>
                        <td class="px-6 py-4">
                            ${shortPositions.reduce((a, b) => a + b.pnl, 0).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex flex-col mt-4">
            <p>SOL Short Positions</p>
            <table class="pools-table w-1/2 mt-4 text-left rtl:text-right border border-white/20">
                <thead class="text-xs bg-[#101010]">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Entry Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Mark Price
                        </th>
                        <th scope="col" class="px-6 py-3">
                            PnL
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <!-- {#each Array(numberOrders) as _, i}
                        {@const amount = ratio / Math.sqrt(ratio / priceTokenA / (priceTokenB - (i * step)))}
                        {@const entryPrice = priceTokenB + -i * step}
                        {@const exitPrice = priceTokenB - (i + 1) * step}
                        {@const pnl = entryPrice * amount - exitPrice * amount}
                        <tr>
                            <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {amount.toFixed(2)}
                            </th>
                            <td class="px-6 py-4">
                                ${entryPrice.toFixed(2)}
                            </td>
                            <td class="px-6 py-4">
                                ${exitPrice.toFixed(2)}
                            </td>
                            <td class="px-6 py-4">
                                ${pnl.toFixed(2)}
                            </td>
                        </tr>
                    {/each} -->
                    <tr>
                        <th scope="row" class="flex flex-row items-center px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {initialAmountTokenA} {nameTokenA}
                        </th>
                        <td class="px-6 py-4">
                            ${initialPriceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${priceTokenA}
                        </td>
                        <td class="px-6 py-4">
                            ${initialAmountTokenA * initialPriceTokenA - initialAmountTokenA * priceTokenA}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>