import { Connection, Transaction } from "@solana/web3.js";
import config from "../config";

export const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${config.helius.apiKey}`);

export const setTransactionBlockhash = async (transaction: Transaction) => {
    const blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
    transaction.recentBlockhash = blockhash;
};