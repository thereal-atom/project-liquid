import Elysia, { t } from "elysia";
import { ctx } from "$lib/server/context";
import { connection, setTransactionBlockhash } from "$lib/server/utils/solana";
import { addRaydiumLiquidity, getRaydiumAddLiquidityQuote, getRaydiumPoolData, raydiumSwap } from "$lib/utils/raydium";
import { PublicKey } from "@solana/web3.js";
import { parseTokenAccountResp } from "@raydium-io/raydium-sdk-v2";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const positionRouter = new Elysia({ prefix: "/position"})
    .use(ctx)
    .get("/", "position router is ok")
    // .get("/all", async ({ raydiumClient }) => {
    //     const publicKey = new PublicKey("CwkbyUSgadcjaYbVmohPHxgYk7G6hnCLLno355njdE13");

    //     const account = await connection.getParsedTokenAccountsByOwner(
    //         publicKey,
    //         { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    //     );

    //     const mintAddresses = account.value.map(({ account }) => account.data.parsed.info.mint);

    //     const res = await fetch(`https://api-v3.raydium.io/pools/info/lps?lps=${mintAddresses.join(",")}`);

    //     const data = await res.json();

    //     const lpPoolMints = data.data.filter(lpMint => lpMint !== null);

    //     console.log(lpPoolMints);

    //     return "ok";
    // })
    // .post(
    //     "/open/prepare",
    //     async ({
    //         body,
    //         raydiumClient,
    //     }) => {
    //         if (!raydiumClient.ownerPubKey) throw 401;
            
    //         // keep in mind - user might cancel the transaction, transaction might fail etc.
    //         // whether or not their is a finalize function, the db row needs to have something like a status property - "preparing", "confirmed", "failed", "cancelled"

    //         // check wallet balances (sol, memecoin)
    //         // check ox fun balances - enough to short sol + memecoin

    //         // create record in database

    //         const poolData = await getRaydiumPoolData(raydiumClient, body.poolId);

    //         // todo: double check if this is clean as it can be if not then clean up
    //         // 'minAmountB' isn't accurate and 'amountA'/'amountB' might not be as clear as it can be
    //         // check if having the client before or after is better as a function property
    //         // todo: quote comes from the front end - it's fetched on initial page load, every 20 seconds, and at least every  3s on type event.
    //         // entire quote object is set to a state variable and then sent along with request
    //         // only issue might be getting types correct
    //         // this is inspired in part by the jupiter swap api: https://station.jup.ag/docs/apis/swap-api
    //         // ? might be related - this should theoretically decrease the time from click to phantom prompt
    //         // this means the slippage should be able to be lower without getting the 'slippage tolerance exceeded' error
    //         // want to get it down to 1% or below rather than the current 3%
    //         // ? also related - should the quote data included in the request be the same as the actual quote data (anotherAmount, maxAnotherAmount, minAnotherAmount, liquidity bns)
    //         // or should it be custom data (amountSol, amountMeme, minAmountMeme or similar, which are also ints, or whatever int * 10 ^ decimals)
    //         const quote = getRaydiumAddLiquidityQuote(raydiumClient, {
    //             amountSol: body.amountSol,
    //             poolData,
    //         });

    //         const amountSol = body.amountSol;
    //         const amountMeme = parseFloat(quote.maxAnotherAmount.toExact());
    //         const minAmountMeme = parseFloat(quote.minAnotherAmount.toExact());

    //         const { transaction } = await addRaydiumLiquidity(raydiumClient, {
    //             poolInfo: poolData.poolInfo,
    //             poolKeys: poolData.poolKeys,
    //             amountA: amountSol,
    //             amountB: amountMeme,
    //             minAmountB: minAmountMeme,
    //             mintA: poolData.mintIn,
    //             mintB: poolData.mintOut,
    //         });
    //         await setTransactionBlockhash(transaction);

    //         const serializedTransaction = transaction.serialize({
    //             requireAllSignatures: false,
    //             verifySignatures: false,
    //         });

    //         return { transaction: serializedTransaction.toString("base64") };
    //     },
    //     {
    //         body: t.Object({
    //             poolId: t.String(),
    //             amountSol: t.Numeric(),
    //         }),
    //     }
    // )
    // .post(
    //     "/open/finalize",
    //     ({ body }) => {
    //         // get transaction (should be signed)

    //         // check ox fun balances - enough to short sol + memecoin
    //         // open short position
    //         // on opening short positions - ox api has a /deposit-addresses endpoint used to get the deposit addresses for an account
    //         // for opening a position - can have is so that a third transaction (1st being swap 2nd being add liquidity)
    //         // is used to deposit sol into the account (the amount needed to hedge with the short) and then open the position
    //         // first issue I can think of is not having enough balance for rebalancing the short


    //         // update database record

    //         console.log(body);

    //         // maybe don't need finalize function. when positions are fetched,
    //         // the ones which are processing - the data is fetched from the blockchain and is updated that way
    //         // issue is that short positions won't be opened until the positions are fetched.
    //         // maybe have just a 'open shorts for position' kind of function which is called onces the transaction is confirmed

    //         return "ok";
    //     },
    //     {
    //         body: t.Object({
    //             poolId: t.String(),
    //         }),
    //     },
    // );