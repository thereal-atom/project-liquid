import { Connection } from "@solana/web3.js";

export const initRpcConnection = (apiKey: string) => {
    const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
        commitment: "confirmed",
    });

    return connection;
};