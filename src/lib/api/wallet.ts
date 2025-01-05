import { client } from ".";

export const getWallet = async (publicKey: string) => {
    const {
        data,
        error,
    } = await client.api.wallet({ publicKey }).get();

    if (error) {
        throw error;
    };

    return data;
};