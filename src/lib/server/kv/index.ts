import config from "$lib/server/config"
import { Redis, type SetCommandOptions } from "@upstash/redis"
import { z } from "zod";

export const kv = new Redis({
    url: config.kv.rest.url,
    token: config.kv.rest.token,
});

export class KVTable <
    InputSchema extends z.ZodTypeAny,
    OutputSchema extends z.ZodTypeAny,
> {
    private kvClient: Redis;
    private name: string;
    private defaultTtlSeconds: number;
    private schemas: {
        input: InputSchema,
        output: OutputSchema,
    };

    private SEPARATOR = ".";
    
    constructor(kvClient: Redis, name: string, options: {
        defaultTtlSeconds?: number,
        inputSchema: InputSchema,
        outputSchema: OutputSchema,
    }) {
        this.kvClient = kvClient;
        this.name = name;
        // 6 hours. too much? too little? necessary?
        this.defaultTtlSeconds = options.defaultTtlSeconds || 3600;
        this.schemas = {
            input: options.inputSchema,
            output: options.outputSchema,
        };
    };

    private getKey(key: string) {
        return this.name + this.SEPARATOR + key;
    };

    async get(key: string): Promise<z.infer<OutputSchema> | null> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = await this.kvClient.get(this.getKey(key)) as any;
        if (!value) return null;

        if (this.schemas.output) {
            return this.schemas.output.parse(JSON.parse(value));
        };

        return value;
    };
    
    async set(key: string, value: z.infer<OutputSchema>, options?: SetCommandOptions) {
        if (this.schemas.input) {
            value = this.schemas.input.parse(value);
        };

        await this.kvClient.set(this.getKey(key), JSON.stringify(value), {
            ...options,
            ex: options?.ex ?? this.defaultTtlSeconds,
        });
    };

    async delete(key: string) {
        await this.kvClient.del(this.getKey(key));
    };
};