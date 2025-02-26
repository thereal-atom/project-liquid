export const load = (async () => {
    const positions = [
        {
            "date": new Date(),
            "name": "SOL-CHILLGUY",
            "liquidityPosition": {
                "poolId": "93tjgwff5Ac5ThyMi8C4WejVVQq4tuMeMuYW1LEYZ7bu",
                "platform": "raydium",
                "transaction": {
                    "timestamp": new Date(),
                    "signature": "",
                    "fee": 0
                },
                "mintA": {
                    "address": "So11111111111111111111111111111111111111112",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "symbol": "WSOL",
                    "name": "Wrapped SOL",
                    "decimals": 9,
                    "logoUrl": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
                    "entryPrice": 211,
                    "entryAmount": 0.478788771,
                },
                "mintB": {
                    "address": "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "symbol": "CHILLGUY",
                    "name": "Just a chill guy",
                    "decimals": 9,
                    "logoUrl": "https://img-v1.raydium.io/icon/Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump.png",
                    "entryPrice": 0.312,
                    "entryAmount": 323.85207,
                },
                "lpMint": {
                    "address": "3mqpzUnHmnLJZZ6txN3XXJgnmDbKU9NDiCnC4i2VqMZb",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "decimals": 9,
                    "entryPrice": 1387.819944674415,
                    "amount": 0.145609667,
                },
            },
            "shortPosition": {
                "platform": "ox.fun",
                "clientOrderId": "1",
                "mintA": {
                    "address": "So11111111111111111111111111111111111111112",
                    "marketCode": "SOL-USD-SWAP-LIN",
                    "baseAsset": "SOL",
                    "counterAsset": "USD",
                    "amount": -0.46,
                    "entryPrice": 215.72,
                    "fee": 0
                },
                "mintB": {
                    "address": "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
                    "marketCode": "CHILLGUY-USD-SWAP-LIN",
                    "baseAsset": "CHILLGUY",
                    "counterAsset": "USD",
                    "amount": -323,
                    "entryPrice": 0.28673758,
                    "fee": 0
                },
                "transaction": {
                    "timestamp": 0,
                    "signature": ""
                }
            },
            "swapTransaction": {
                "timestamp": 0,
                "signature": "",
                "fee": 0
            }
        },

        {
            "date": new Date(),
            "name": "SOL-PENGU",
            "liquidityPosition": {
                "poolId": "2ux1qsjpAHFV7ZmRXpjfjM5uwr5a5AHpMxTdTonASRZ5",
                "platform": "raydium",
                "transaction": {
                    "timestamp": new Date(),
                    "signature": "",
                    "fee": 0
                },
                "mintA": {
                    "address": "So11111111111111111111111111111111111111112",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "symbol": "WSOL",
                    "name": "Wrapped SOL",
                    "decimals": 9,
                    "logoUrl": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
                    "entryPrice": 223.805,
                    "entryAmount": 0.10022,
                },
                "mintB": {
                    "address": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "symbol": "PENGU",
                    "name": "PENGU",
                    "decimals": 9,
                    "logoUrl": "https://img-v1.raydium.io/icon/2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv.png",
                    "entryPrice": 0.05579207920792079,
                    "entryAmount": 404,
                },
                "lpMint": {
                    "address": "CCtcWHfSAvkT5pjKBokvejdFK15t1v5RLQetdfA3qeAP",
                    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                    "decimals": 9,
                    "entryPrice": 94161.05162211623,
                    "amount": 0.000477586,
                },
            },
            "shortPosition": undefined
            // "shortPosition": {
            //     "platform": "ox.fun",
            //     "clientOrderId": "1",
            //     "mintA": {
            //         "address": "So11111111111111111111111111111111111111112",
            //         "marketCode": "SOL-USD-SWAP-LIN",
            //         "baseAsset": "SOL",
            //         "counterAsset": "USD",
            //         "amount": -0.46,
            //         "entryPrice": 215.72,
            //         "fee": 0
            //     },
            //     "mintB": {
            //         "address": "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
            //         "marketCode": "CHILLGUY-USD-SWAP-LIN",
            //         "baseAsset": "CHILLGUY",
            //         "counterAsset": "USD",
            //         "amount": -323,
            //         "entryPrice": 0.28673758,
            //         "fee": 0
            //     },
            //     "transaction": {
            //         "timestamp": 0,
            //         "signature": ""
            //     }
            // },
            // "swapTransaction": {
            //     "timestamp": 0,
            //     "signature": "",
            //     "fee": 0
            // }
        },
    ];

    const options = {
        contract_address: "93tjgwff5Ac5ThyMi8C4WejVVQq4tuMeMuYW1LEYZ7bu,2ux1qsjpAHFV7ZmRXpjfjM5uwr5a5AHpMxTdTonASRZ5",
        network_slug: "solana",
    };

    const assetsQuoteRes = await fetch(`https://pro-api.coinmarketcap.com/v4/dex/pairs/quotes/latest?${new URLSearchParams(options).toString()}`, {
        headers: {
            "X-CMC_PRO_API_KEY": CMC_API_KEY,
        },
    });

    const { data: assetsQuoteData } = await assetsQuoteRes.json();

    const lpPoolsQuoteRes = await fetch(`https://api-v3.raydium.io/pools/info/ids?ids=${options.contract_address}`);

    const lpPoolsQuoteData = await lpPoolsQuoteRes.json();

    return {
        positions,
        marketData: {
            lpPools: {
                "93tjgwff5Ac5ThyMi8C4WejVVQq4tuMeMuYW1LEYZ7bu": lpPoolsQuoteData.data[0],
                "2ux1qsjpAHFV7ZmRXpjfjM5uwr5a5AHpMxTdTonASRZ5": lpPoolsQuoteData.data[1],
            },
            assets: {
                "93tjgwff5Ac5ThyMi8C4WejVVQq4tuMeMuYW1LEYZ7bu": assetsQuoteData[0],
                "2ux1qsjpAHFV7ZmRXpjfjM5uwr5a5AHpMxTdTonASRZ5": assetsQuoteData[1],
            },
        },
    };
});