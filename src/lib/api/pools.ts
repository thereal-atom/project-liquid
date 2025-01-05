import { client } from ".";

export const getPoolQuote = async (poolId: string, amountSol: number = 1) => {
    const {
        data,
        error,
    } = await client.api.pool({ id: poolId }).quote.get({ query: { amountSol } });

    if (error) {
        throw error;
    };

    return data;
};