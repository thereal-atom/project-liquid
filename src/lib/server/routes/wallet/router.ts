import { ctx } from "$lib/server/context";
import { connection } from "$lib/server/utils/solana";
import { PublicKey } from "@solana/web3.js";
import Elysia from "elysia";

export const walletRouter = new Elysia({ prefix: "/wallet"})
    .use(ctx)
    .get("/", "wallet router is ok")
    .get("/:publicKey", async ({ params }) => {
        const pubKey = new PublicKey(params.publicKey);

        const accountInfo = await connection.getParsedAccountInfo(pubKey);

        return accountInfo.value;
    });