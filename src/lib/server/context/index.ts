import Elysia from "elysia";
import config from "../config";
import { RequestError } from "../utils/errors";
import { logger } from "../utils/logger";
import { initRaydiumClient } from "$lib/utils/raydium";
import { connection } from "../utils/solana";

export const ctx = new Elysia({ name: "@app/ctx" })
    .onStart(({ server }) => {
        logger.info(`Project Liquid ${config.env} server running at ${server?.hostname}:${server?.port}`);
    })
    .onError(
        { as: "global" },
        ({
            code,
            error,
            set,
        }) => {
            set.status = 500;

            if (code === "NOT_FOUND") {
                set.status = 404;
            };

            logger.error(error);

            if (error instanceof RequestError && error.statusCode) {
                set.status = error.statusCode;
            };

            return {
                status: set.status,
                message: error.message,
            };
        })
    .resolve(
        { as: "global" },
        async ({ headers }) => {
            const publicKey = headers["x-public-key"];
            if (!publicKey) {
                const raydiumClient = await initRaydiumClient({}, connection);

                return { raydiumClient };
            };

            const raydiumClient = await initRaydiumClient({ ownerPublicKey: publicKey }, connection);

            return { raydiumClient };
        },
    );