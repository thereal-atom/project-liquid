import { constants } from "$lib/config";
import type { GetRaydiumQuoteOptions, RaydiumPoolData } from "$lib/types/raydium";
import { AMM_STABLE, AMM_V4, DEVNET_PROGRAM_ID, Percent, Raydium, TokenAmount, toToken, type AmmRpcData, type AmmV4Keys, type AmmV5Keys, type ApiV3PoolInfoStandardItem, type ApiV3Token } from "@raydium-io/raydium-sdk-v2";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";

const VALID_PROGRAM_ID = new Set([
    AMM_V4.toBase58(),
    AMM_STABLE.toBase58(),
    DEVNET_PROGRAM_ID.AmmV4.toBase58(),
    DEVNET_PROGRAM_ID.AmmStable.toBase58(),
]);

export const isValidAmm = (id: string) => VALID_PROGRAM_ID.has(id);

export const initRaydiumClient = async (options: { ownerPublicKey?: string }, connection: Connection) => {
    // TODO: extract this regex
    if (options.ownerPublicKey && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(options.ownerPublicKey)) {
        throw new Error("Invalid owner public key");
    };

    const raydiumClient = await Raydium.load({
        connection,
        owner: options.ownerPublicKey ? new PublicKey(options.ownerPublicKey) : undefined,
    });
  
    return raydiumClient;
};

export const raydiumFetch = async (path: string, options?: {
    query?: Record<string, string>;
}) => {
    const res = await fetch(`https://api-v3.raydium.io${path}${options?.query ? `?${new URLSearchParams(options?.query)}` : ""}`, {
        method: "GET",
        ...options,
    });

    // TODO: proper error handling

    const data = await res.json();

    return data;
};

export const getRaydiumMintPrices = async (mints: string[]) => {
    const data = await raydiumFetch("/mint/price", {
        query: {
            mints: mints.join(","),
        },
    });

    const prices = data.data;

    return prices;
};

export const getRaydiumPoolInfoFromRpc = async (raydiumClient: Raydium, poolId: string) => {
    const poolRpcInfo = await raydiumClient.liquidity.getPoolInfoFromRpc({ poolId });

    return poolRpcInfo;
};

export const getRaydiumPoolInfo = async (raydiumClient: Raydium, poolId: string) => {
    const poolInfo = await raydiumClient.api.fetchPoolById({ ids: poolId });

    return poolInfo[0] as ApiV3PoolInfoStandardItem | undefined;
};

// ? get all pool data
// ? this includes pool info but also rpc data and keys which are often necessary for swaps and liquidity operations
export const getRaydiumPoolData = async (raydiumClient: Raydium, poolId: string): Promise<RaydiumPoolData> => {
    const pools = await raydiumClient.api.fetchPoolById({ ids: poolId });

    const poolInfo = pools[0] as ApiV3PoolInfoStandardItem | undefined;
    if (!poolInfo?.programId || !isValidAmm(poolInfo.programId)) {
        throw new Error("Target pool is not AMM pool");
    };

    const poolRpcData = await raydiumClient.liquidity.getRpcPoolInfo(poolId) as AmmRpcData;
    const poolKeys = await raydiumClient.liquidity.getAmmPoolKeys(poolId);

    // ? make sure input mint is always solana
    const inputMintAddress = NATIVE_MINT.toBase58();
    const baseIn = inputMintAddress === poolInfo.mintA.address;
    const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];

    return {
        poolInfo,
        poolRpcData,
        poolKeys,
        baseIn,
        mintIn,
        mintOut,
    };
};

export const getRaydiumSwapQuote = (raydiumClient: Raydium, options: GetRaydiumQuoteOptions) => {
    const amountIn = options.amountSol * 10 ** 9;
    
    const quote = raydiumClient.liquidity.computeAmountOut({
        poolInfo: {
            ...options.poolData.poolInfo,
            baseReserve: options.poolData.poolRpcData.baseReserve,
            quoteReserve: options.poolData.poolRpcData.quoteReserve,
            status: options.poolData.poolRpcData.status.toNumber(),
            version: 4,
        },
        amountIn: new BN(amountIn),
        mintIn: options.poolData.mintIn.address,
        mintOut: options.poolData.mintOut.address,
        // ? default is 1% or 0.01
        slippage: options.slippage
            ? options.slippage
            : 0.01,
    });

    return quote;
};

export const raydiumSwap = async (raydiumClient: Raydium, options: {
    poolInfo: ApiV3PoolInfoStandardItem,
    poolKeys: AmmV5Keys | AmmV4Keys,
    amountIn: number,
    amountOut: number,
    mintInAddress: string,
}) => {
    const { transaction } = await raydiumClient.liquidity.swap({
        poolInfo: options.poolInfo,
        poolKeys: options.poolKeys,
        amountIn: new BN(options.amountIn),
        amountOut: new BN(options.amountOut),
        fixedSide: "in",
        inputMint: options.mintInAddress,
        txVersion: constants.txVersion,
        // todo: function to get compute budget
        computeBudgetConfig: {
            units: 600000,
            microLamports: 46591500,
        },
    });

    return { transaction };
};

export const getRaydiumAddLiquidityQuote = (raydiumClient: Raydium, options: GetRaydiumQuoteOptions) => {
    const quote = raydiumClient.liquidity.computePairAmount({
        poolInfo: options.poolData.poolInfo,
        amount: options.amountSol.toString(),
        baseIn: options.poolData.baseIn,
        // ? default is 3%
        slippage: new Percent(options.slippage ? options.slippage * 100 : 3, 100),
    });

    // another amount is amount
    // maxAnotherAmount is max amount (amount + slippage)
    // minAnotherAmount is min amount (amount - slippage)

    return quote;
};

export const addRaydiumLiquidity = async (raydiumClient: Raydium, options: {
    poolInfo: ApiV3PoolInfoStandardItem,
    poolKeys: AmmV5Keys | AmmV4Keys,
    amountA: number,
    amountB: number,
    minAmountB: number,
    mintA: ApiV3Token,
    mintB: ApiV3Token,
}) => {
    const { transaction } = await raydiumClient.liquidity.addLiquidity({
        poolInfo: options.poolInfo,
        poolKeys: options.poolKeys,
        amountInA: new TokenAmount(
            toToken(options.mintA),
            new Decimal(options.amountA).mul(10 ** options.mintA.decimals).toFixed(0)
        ),
        amountInB: new TokenAmount(
            toToken(options.mintB),
            new Decimal(options.amountB).mul(10 ** options.mintB.decimals).toFixed(0),
        ),
        otherAmountMin: new TokenAmount(
            toToken(options.mintB),
            new Decimal(options.minAmountB).mul(10 ** options.mintB.decimals).toFixed(0),
        ),
        // ? setting to "b" (although it might just be the side that's the memecoin) seems
        // ? to cause "Transaction reverted in simulation. Slippage tolerance exceeded." error
        fixedSide: "a",
        txVersion: constants.txVersion,
        // ? lamports seems to be (units * microLamports) / 1_000_000
        // todo: function to get compute budget
        computeBudgetConfig: {
            units: 600_000,
            microLamports: 4_591_500,
        },
    });

    return { transaction };
};