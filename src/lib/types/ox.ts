// export interface OxOrder {
//     clientOrderId?: number;
//     marketCode: string;
//     side: "BUY" | "SELL";
//     quantity: number;
//     amount?: number;
//     displayQuantity?: number;
//     timeInForce?: "GTC" | "IOC";
//     orderType: "LIMIT" | "MARKET" | "STOP_LIMIT" | "STOP_MARKET";
//     price?: number;
//     stopPrice?: number;
//     limitPrice?: number;
// };

export interface OxOrder {
    clientOrderId?: number;
    marketCode: string;
    side: "BUY" | "SELL";
    quantity: number;
    orderType: "MARKET";
};

export type OxURL = "stgapi.ox.fun" | "api.ox.fun";
export type OxVerb = "GET" | "POST" | "PUT" | "DELETE";

export interface OxClientConfig {
    apiKey: string;
    apiSecret: string;
};