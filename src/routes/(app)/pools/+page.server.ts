import type { PageServerLoad } from "./$types";

export const load = (async () => {
    const poolsRes = await fetch(`https://api-v3.raydium.io/pools/info/list?poolType=standard&poolSortField=volume7d&sortType=desc&pageSize=1000&page=1`);
    const poolsData = await poolsRes.json();
    const pools = poolsData.data.data;

    return { pools };
}) satisfies PageServerLoad;