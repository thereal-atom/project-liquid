export const fetchJupiterSwapQuote = async (options: {
    mintInAddress: string;
    mintOutAddress: string;
    amount: number;
}) => {
    const query = new URLSearchParams({
        inputMint: options.mintInAddress,
        outputMint: options.mintOutAddress,
        amount: options.amount.toString(),
        // 300 is 3% (I think)
        slippageBps: (300).toString(),
    });

    const quoteResponse = await fetch(`https://quote-api.jup.ag/v6/quote?${query}`);

    const swapQuote = await quoteResponse.json();

    return swapQuote;
};

export const jupiterSwap = async (options: { userPublicKey: string }) => {
    const swapResponse = await fetch("https://quote-api.jup.ag/v6/quote", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            quoteResponse: {},
            userPublicKey: options.userPublicKey,
        }),
    });

    const swapData = await swapResponse.json();

    return swapData;
};