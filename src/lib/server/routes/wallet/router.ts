import { ctx } from "$lib/server/context";
import { connection } from "$lib/server/utils/solana";
import { PublicKey } from "@solana/web3.js";
import Elysia, { t } from "elysia";

export const walletRouter = new Elysia({ prefix: "/wallet"})
    .use(ctx)
    .get("/", "wallet router is ok")
    .get("/:publicKey", async ({ params }) => {
        const pubKey = new PublicKey(params.publicKey);

        const accountInfo = await connection.getParsedAccountInfo(pubKey);

        return accountInfo.value;
    })
    // .get(
    //     "/:publicKey/token-account/balance",
    //     async ({
    //         params,
    //         query,
    //     }) => {
    //         const tokenAccountResponse = await connection.getParsedTokenAccountsByOwner(
    //             new PublicKey(params.publicKey),
    //             {
    //                 programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    //                 mint: new PublicKey(query.mint),
    //             },
    //         );

    //         const tokenAccountData = tokenAccountResponse.value[0];

    //         return tokenAccountData.account.data.parsed.info.tokenAmount;
    //     },
    //     {
    //         query: t.Object({
    //             mint: t.String(),
    //         }),
    //         detail: {
    //             description: `Essentially a user's balance of a specific token. Returns an object with different types of amounts (amount and decimals as well as uiAmount).`
    //         },
    //     },
    // );