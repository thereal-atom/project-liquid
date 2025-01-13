import { Connection, PublicKey, type TokenAmount } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WSOLMint, type ApiV3PoolInfoStandardItem, type ApiV3Token } from "@raydium-io/raydium-sdk-v2";

export const initRpcConnection = (apiKey: string) => {
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
        commitment: "confirmed",
    });

    return connection;
};

export const getAccountBalance = async (connection: Connection, pubKeyString: string) => {
    const balance = await connection.getBalance(new PublicKey(pubKeyString));

    return balance;
};

export const getTokenAccountAmountByOwner = async (connection: Connection, ownerPubKeyString: string, mintAddress: string) => {
    const tokenAccountsData = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(ownerPubKeyString),
        {
            mint: new PublicKey(mintAddress),
            programId: TOKEN_PROGRAM_ID,
        },
    );

    const tokenAccount = tokenAccountsData.value[0];
    if (!tokenAccount) return;

    return tokenAccount.account.data.parsed.info.tokenAmount as TokenAmount;
};

// ? lamports seems to be (units * microLamports) / 1_000_000
// todo: make work
export const getComputeBudgetConfig = () => {
    return {
        units: 600_000,
        microLamports: 4_591_500,
    };
};

export const wSolToSolString = (name?: string) => {
    return name ? name.replace(/WSOL/gi, "SOL") : "";
};

export const getMintSymbol = (mint: ApiV3Token, transformSol = true) => {
    return transformSol ? wSolToSolString(mint.symbol) : mint.symbol;
};

export const getPoolSolMint = (pool: ApiV3PoolInfoStandardItem) => {
    return pool.mintA.address === WSOLMint.toBase58() ? pool.mintA : pool.mintB;
};