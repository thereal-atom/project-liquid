import Elysia, { t } from "elysia";
import { getRaydiumAddLiquidityQuote, getRaydiumPoolData, getRaydiumPoolInfoFromRpc, getRaydiumSwapQuote, raydiumSwap } from "$lib/utils/raydium";
import { ctx } from "$lib/server/context";

export const poolRouter = new Elysia({ prefix: "/pool"})
    .use(ctx)
    .get("/", "pool router is ok")
    .get(
        "/:id/rpc-data",
        async ({
            params,
            raydiumClient,
        }) => {
            const rpcPoolData = await getRaydiumPoolInfoFromRpc(raydiumClient, params.id);

            return {
                rpcData: {
                    baseReserve: {
                        amountString: rpcPoolData.poolRpcData.baseReserve.toString(),
                        uiAmount: rpcPoolData.poolRpcData.baseReserve.toNumber() / 10 ** rpcPoolData.poolInfo.mintA.decimals,
                        decimals: rpcPoolData.poolInfo.mintA.decimals,
                        mint: rpcPoolData.poolInfo.mintA.address,
                    },
                    quoteReserve: {
                        amountString: rpcPoolData.poolRpcData.quoteReserve.toString(),
                        uiAmount: rpcPoolData.poolRpcData.quoteReserve.toNumber() / 10 ** rpcPoolData.poolInfo.mintB.decimals,
                        decimals: rpcPoolData.poolInfo.mintB.decimals,
                        mint: rpcPoolData.poolInfo.mintB.address,
                    },
                    status: rpcPoolData.poolRpcData.status.toNumber(),
                },
                poolKeys: rpcPoolData.poolKeys,
            };
        },
    )
    .get(
        "/:id/quote",
        async ({
            params,
            query,
            raydiumClient,
        }) => {
            if (!raydiumClient) throw 401;

            const poolData = await getRaydiumPoolData(raydiumClient, params.id);

            const slippage = 0.01;

            const swapQuoteData = getRaydiumSwapQuote(raydiumClient, {
                poolData,
                amountSol: query.amountSol,
                slippage,
            });

            const swapQuote = {
                amountOut: parseFloat(swapQuoteData.amountOut.toString()) / 10 ** poolData.mintOut.decimals,
                minAmountOut: parseFloat(swapQuoteData.minAmountOut.toString()) / 10 ** poolData.mintOut.decimals,
                currentPrice: parseFloat(swapQuoteData.currentPrice.toString()),
                executionPrice: parseFloat(swapQuoteData.executionPrice.toString()),
                priceImpact: parseFloat(swapQuoteData.priceImpact.toString()),
                fee: parseFloat(swapQuoteData.fee.toString()) / 10 ** 9,
                slippage,
            };

            const addLiquidityQuoteData = getRaydiumAddLiquidityQuote(raydiumClient, {
                poolData,
                amountSol: query.amountSol,
                slippage,
            });

            const addLiquidityQuote = {
                anotherAmount: parseFloat(addLiquidityQuoteData.anotherAmount.toExact()),
                maxAnotherAmount: parseFloat(addLiquidityQuoteData.maxAnotherAmount.toExact()),
                minAnotherAmount: parseFloat(addLiquidityQuoteData.minAnotherAmount.toExact()),
                liquidity: parseFloat(addLiquidityQuoteData.liquidity.toString()),
                slippage,
            };

            // ? input amount is in SOL (mint A), and a ui amount
            // ? the values on the swap and add liquidity quotes are the ui amounts
            // ? the fee (on swapQuote) is in SOL (0.25% of the SOL input amount)

            return {
                swapQuote,
                addLiquidityQuote,
            };
        },
        {
            query: t.Object({
                amountSol: t.Numeric(),
            }),
        },
    )
    .post(
        "/:id/swap",
        async ({
            params,
            body,
            raydiumClient,
        }) => {
            const poolData = await getRaydiumPoolData(raydiumClient, params.id);
            
            const { transaction } = await raydiumSwap(raydiumClient, {
                poolInfo: poolData.poolInfo,
                poolKeys: poolData.poolKeys,
                amountIn: body.amountIn,
                amountOut: body.swapQuote.minAmountOut,
                mintInAddress: body.mintInAddress,
            });
            
            return { transaction };
        },
        {
            body: t.Object({
                amountIn: t.Number(),
                mintInAddress: t.String(),
                swapQuote: t.Object({
                    minAmountOut: t.Number(),
                }),
            }),
        },
    );
    // .get(
    //     "/:id/add-liquidity-quote",
    //     async ({
    //         params,
    //         query,
    //         raydiumClient,
    //     }) => {

    //     },
    // );