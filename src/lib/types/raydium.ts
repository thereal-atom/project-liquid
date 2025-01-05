import type { AmmRpcData, AmmV4Keys, AmmV5Keys, ApiV3PoolInfoStandardItem } from "@raydium-io/raydium-sdk-v2";
import type BN from "bn.js";
import type { TokenAmount } from "@solana/web3.js";

export interface RaydiumPoolData {
    poolInfo: ApiV3PoolInfoStandardItem;
    poolRpcData: AmmRpcData;
    poolKeys: AmmV4Keys | AmmV5Keys;
    baseIn: boolean;
    mintIn: ApiV3PoolInfoStandardItem["mintA"];
    mintOut: ApiV3PoolInfoStandardItem["mintB"];
};

export interface GetRaydiumQuoteOptions {
    poolData: RaydiumPoolData;
    slippage?: number;
    amountSol: number;
};

export interface RaydiumAddLiquidityQuote {
    anotherAmount: TokenAmount;
    maxAnotherAmount: TokenAmount;
    minAnotherAmount: TokenAmount;
    liquidity: BN;
};