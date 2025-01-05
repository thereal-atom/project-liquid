import { PUBLIC_API_URL } from "$env/static/public";
import { z } from "zod";
import constants from "./constants";

const envData = {
    PUBLIC_API_URL,
};

const envSchema = z.object({
    PUBLIC_API_URL: z
        .string()
        .url(),
});

const env = envSchema.parse(envData);

const config = {
    apiUrl: env.PUBLIC_API_URL,
};

export default config;

export { constants };