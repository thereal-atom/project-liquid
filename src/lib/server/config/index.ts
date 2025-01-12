import {
    NODE_ENV,

    HELIUS_API_KEY,

    // WALLET_PRIVATE_KEY,
    // WALLET_PUBLIC_KEY,

    // CMC_API_KEY,

    // KV_URL,
    // KV_REST_API_READ_ONLY_TOKEN,
    // KV_REST_API_TOKEN,
    // KV_REST_API_URL,
} from "$env/static/private";
import { z } from "zod";

const envData = {
    NODE_ENV,

    HELIUS_API_KEY,

    // WALLET_PRIVATE_KEY,
    // WALLET_PUBLIC_KEY,
    
    // CMC_API_KEY,

    // KV_URL,
    // KV_REST_API_READ_ONLY_TOKEN,
    // KV_REST_API_TOKEN,
    // KV_REST_API_URL,
};

const envSchema = z.object({
    NODE_ENV: z.literal("development"),

    HELIUS_API_KEY: z.string(),

    // WALLET_PRIVATE_KEY: z.string(),
    // WALLET_PUBLIC_KEY: z.string(),

    // CMC_API_KEY: z.string(),

    // KV_URL: z.string(),
    // KV_REST_API_READ_ONLY_TOKEN: z.string(),
    // KV_REST_API_TOKEN: z.string(),
    // KV_REST_API_URL: z.string(),
});

const env = envSchema.parse(envData);

const config = {
    env: env.NODE_ENV,
    helius: {
        apiKey: env.HELIUS_API_KEY,
    },
    // wallet: {
    //     publicKey: env.WALLET_PUBLIC_KEY,
    //     privateKey: env.WALLET_PRIVATE_KEY,
    // },
    // coinMarketCap: {
    //     apiKey: env.CMC_API_KEY,
    // },
    // kv: {
    //     url: env.KV_URL,
    //     rest: {
    //         readOnlyToken: env.KV_REST_API_READ_ONLY_TOKEN,
    //         token: env.KV_REST_API_TOKEN,
    //         url: env.KV_REST_API_URL,
    //     },
    // },
};

export default config;