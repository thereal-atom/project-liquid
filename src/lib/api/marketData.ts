import { client } from ".";

export const getTokenPrices = async (addresses: string[]) => {
    const {
        error,
        data,
    } = await client.api["market-data"].tokens.get({ query: { addresses: addresses.join(",") } });

    if (error) {
        throw error;
    };

    return data;
};