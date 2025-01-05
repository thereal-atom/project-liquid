import {
    NODE_ENV,

    HELIUS_API_KEY,

    WALLET_PRIVATE_KEY,
    WALLET_PUBLIC_KEY,

    CMC_API_KEY,
} from "$env/static/private";
import { z } from "zod";

const envData = {
    NODE_ENV,

    HELIUS_API_KEY,

    WALLET_PRIVATE_KEY,
    WALLET_PUBLIC_KEY,
    
    CMC_API_KEY,
};

const envSchema = z.object({
    NODE_ENV: z.literal("development"),

    HELIUS_API_KEY: z.string(),

    WALLET_PRIVATE_KEY: z.string(),
    WALLET_PUBLIC_KEY: z.string(),

    CMC_API_KEY: z.string(),
});

const env = envSchema.parse(envData);

const config = {
    env: env.NODE_ENV,
    helius: {
        apiKey: env.HELIUS_API_KEY,
    },
    wallet: {
        publicKey: env.WALLET_PUBLIC_KEY,
        privateKey: env.WALLET_PRIVATE_KEY,
    },
    coinMarketCap: {
        apiKey: env.CMC_API_KEY,
    },
};

export default config;