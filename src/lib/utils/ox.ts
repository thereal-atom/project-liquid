import type { OxClientConfig, OxOrder, OxURL, OxVerb } from "$lib/types/ox";
import crypto from "crypto-browserify";

export class OxClient {
    apiKey: string;
    apiSecret: string;

    constructor(config: OxClientConfig) {
        this.apiKey = config.apiKey;
        this.apiSecret = config.apiSecret;
    };

    private generateSignature(data: {
        timestamp: string,
        nonce: string,
        verb: OxVerb,
        url: OxURL,
        path: string,
        body?: string,
    }): string {
        const msgString = `${data.timestamp}\n${data.nonce}\n${data.verb}\n${data.url}\n${data.path}\n${data.body || ""}`;
    
        const hmac = crypto
            .createHmac("sha256", this.apiSecret)
            .update(msgString)
            .digest("base64");
    
        return hmac;
    };

    private async makeRequest(options: {
        url: OxURL,
        path: string,
        body?: Record<string, any>,
        method: OxVerb,
    }): Promise<any> {
        const nonce = Math.floor(Math.random() * 1000);
        const timestamp = new Date().toISOString();
    
        const signature = this.generateSignature({
            timestamp,
            nonce: nonce.toString(),
            url: options.url,
            path: options.path,
            verb: options.method,
            body: JSON.stringify(options.body),
        });
    
        const res = await fetch(`https://${options.url}${options.path}`, {
            headers: {
                "Content-Type": "application/json",
                "AccessKey": this.apiKey,
                "Timestamp": timestamp,
                "Signature": signature,
                "Nonce": nonce.toString(),
            },
            body: JSON.stringify(options.body),
            method: options.method,
        });
    
        if (res.status === 200) {
            const {
                success,
                data,
            } = await res.json();
    
            if (!success) {
                console.log(data);
                console.log(res);
    
                throw new Error("error making request");
            };
    
            return data;
        };
    
        console.error(res);
    
        throw new Error("Failed to make request");
    };

    async placeOrder(orders: OxOrder[]) {
        const res = await this.makeRequest({
            url: "api.ox.fun",
            path: "/v3/orders/place",
            method: "POST",
            body: {
                recvWindow: 20_000,
                responseType: "FULL",
                timestamp: Date.now().toString(),
                orders,
            },
        });
    
        return res;
    };

    async getBalances(includeSmallBalances = false) {
        const accounts: {
            accountId: string;
            name: string;
            balances: {
                asset: string;
                total: string;
                available: string;
                reserved: string;
                lastUpdatedAt: string;
            }[];
        }[] = await this.makeRequest({
            url: "api.ox.fun",
            path: "/v3/balances",
            method: "GET",
        });
        
        const account = accounts[0];
        if (!account) throw new Error("Failed to get account balances.");

        const balances = account.balances;
        if (!balances) throw new Error("Failed to get account balances.");

        if (includeSmallBalances) {
            return balances;
        };

        return balances.filter(balance => parseFloat(balance.total) > 0.1);
    };

    createSubAccount(name: string) {
        const res = this.makeRequest({
            url: "api.ox.fun",
            path: "/v3/account",
            method: "POST",
            body: {
                name,
            },
        });

        return res;
    };
};

export const initOxClient = (config: OxClientConfig) => {
    const oxClient = new OxClient(config);

    return oxClient;
};


// // =============================================================================

// export const getOxShortPositions = async () => {
//     const accounts = await makeOxRequest({
//         url: "api.ox.fun",
//         path: "/v3/positions",
//         method: "GET",
//     });

//     const positions: {
//         marketCode: string;
//         baseAsset: string;
//         counterAsset: string;
//         position: string;
//         entryPrice: string;
//         markPrice: string;
//         positionPnl: string;
//         estLiquidationPrice: string;
//         lastUpdatedAt: string;
//         leverage: string;
//     }[] = accounts[0].positions;
//     const shortPositions = positions.filter(position => parseFloat(position.position) < 0);

//     return shortPositions.map(position => {
//         const amount = parseFloat(position.position);
//         const markPrice = parseFloat(position.markPrice);
//         const entryPrice = parseFloat(position.entryPrice);
//         const positionPnl = amount * (markPrice - entryPrice);

//         return {
//             amount,
//             markPrice,
//             value: amount * markPrice,
//             entryPrice,
//             entryValue: amount * entryPrice,
//             pnl: positionPnl,
//             marketCode: position.marketCode,
//             baseAsset: position.baseAsset,
//             counterAsset: position.counterAsset,
//         };
//     });
// };

// export const getOxPositionsValue = async () => {
//     const shortPositions = await getOxShortPositions();

//     const totalAccountValue = shortPositions.reduce((acc, position) => {
//         return acc + position.value;
//     }, 0);

//     return totalAccountValue;
// };

// export const getOxPositionsPnl = async () => {
//     const shortPositions = await getOxShortPositions();

//     const totalPnl = shortPositions.reduce((acc, position) => {
//         return acc + position.pnl;
//     }, 0);

//     return totalPnl;
// };

// export const openShortPositions = async (data: {
//     mintA: {
//         amount: string;
//         marketCode: string;
//     },
//     mintB: {
//         amount: string;
//         marketCode: string;
//     },
// }) => {
//     const res = await makeOxRequest({
//         url: "api.ox.fun",
//         path: "/v3/orders/place",
//         method: "POST",
//         body: {
//             recvWindow: 20_000,
//             responseType: "FULL",
//             timestamp: Date.now().toString(),
//             orders: [
//                 {
//                     clientOrderId: 123456789,
//                     marketCode: data.mintA.marketCode,
//                     side: "SELL",
//                     // if the market code includes "1000" then divide amount by 1000
//                     quantity: data.mintA.amount,
//                     orderType: "MARKET",
//                 },
//                 // {
//                 //     clientOrderId: 1612249737725,
//                 //     marketCode: data.mintB.marketCode,
//                 //     side: "SELL",
//                 //     quantity: data.mintB.amount,
//                 //     orderType: "MARKET",
//                 // }
//             ],
//         },
//     });

//     return res;
// };

export * from "../types/ox";