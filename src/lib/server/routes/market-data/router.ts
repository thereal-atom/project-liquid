import { ctx } from "$lib/server/context";
import { getRaydiumMintPrices } from "$lib/utils/raydium";
import Elysia, { t } from "elysia";

export const marketDataRouter = new Elysia({ prefix: "/market-data"})
    .use(ctx)
    .get("/", "market data router is ok")
    .get(
        "/tokens",
        async ({
            query,
        }) => {
            const prices = await getRaydiumMintPrices(query.addresses.split(","));

            return prices;
        },
        {
            query: t.Object({
                addresses: t.String(),
            }),
        },
    )