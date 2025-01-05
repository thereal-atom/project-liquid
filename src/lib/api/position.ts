import { client } from "."

export const openPositionPrepare = async (data: {
    poolId: string;
    amountSol: number;
}) => {
    const {
        data: openPositionPrepareData,
        error,
    } = await client.api.position.open.prepare.post(data);

    if (error) {
        throw error;
    };

    return openPositionPrepareData;
};