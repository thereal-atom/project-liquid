import Elysia from "elysia";

import { poolRouter } from "./pool/router";
import { marketDataRouter } from "./market-data/router";
import { walletRouter } from "./wallet/router";
import { positionRouter } from "./position/router";

export const api = new Elysia({ prefix: "/api" })
    .get("/", () => "API router is OK.")
    .use(poolRouter)
    .use(marketDataRouter)
    .use(walletRouter)
    .use(positionRouter);