import { Connection, PublicKey, type TokenAmount } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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