import config from "$lib/server/config"
import { Redis, type SetCommandOptions } from "@upstash/redis"
import { z } from "zod";

export const cache = new Redis({
    url: config.kv.rest.url,
    token: config.kv.rest.token,
});

export class CacheTable <Schema extends z.ZodTypeAny> {
    private cacheClient: Redis;
    private name: string;
    private defaultTtlSeconds: number;
    private schema: Schema;

    private SEPARATOR = ".";
    
    constructor(cacheClient: Redis, name: string, options: {
        defaultTtlSeconds?: number,
        schema: Schema,
    }) {
        this.cacheClient = cacheClient;
        this.name = name;
        // 6 hours. too much? too little? necessary?
        this.defaultTtlSeconds = options.defaultTtlSeconds || 3600;
        this.schema = options.schema;
    };

    private getKey(key: string) {
        return this.name + this.SEPARATOR + key;
    };

    async get(key: string): Promise<z.infer<Schema> | null> {
        const value = await this.cacheClient.get(this.getKey(key)) as any;
        if (!value) return null;

        return this.schema.parse(JSON.parse(value));
    };
    
    async set(key: string, value: z.infer<Schema>, options?: SetCommandOptions) {
        value = this.schema.parse(value);

        await this.cacheClient.set(this.getKey(key), JSON.stringify(value), {
            ...options,
            ex: options?.ex ?? this.defaultTtlSeconds,
        });
    };

    async delete(key: string) {
        await this.cacheClient.del(this.getKey(key));
    };
};

const cachePoolInfoSchema = z.object({
    baseReserve: z.object({
        amount: z.number(),
        decimals: z.number(),
    }),
    quoteReserve: z.object({
        amount: z.number(),
        decimals: z.number(),
    }),
    status: z.number(),
});

export const cachePoolInfoTable = new CacheTable(cache, "rpcPoolInfo", {
    defaultTtlSeconds: 30,
    schema: cachePoolInfoSchema,
});

export interface CachePoolInfo {
    baseReserve: {
        amount: number;
        decimals: number;
    };
    quoteReserve: {
        amount: number;
        decimals: number;
    };
    status: number;
};

export interface CacheTokenAccountAmount {
    amount: number;
    decimals: number;
};