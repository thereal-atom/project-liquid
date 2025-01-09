import { LocalStorage } from "$lib/utils/localStorage.svelte";
import { getContext, setContext } from "svelte";

const TOKEN_BALANCES_KEY = "_pl_token-balances";
// const TOKEN_ACCOUNT_EXPIRY_TIME = 30_000;

const defaultWalletState = {
    pubKeyString: null,
};

interface TokenAccount {
    balance: number;
    lastUpdatedTimestamp: number;
};

class WalletState {
    pubKeyString: string | null = $state(null);
    tokenBalances: Record<string, TokenAccount> = $state({});

    private _tokenBalances = new LocalStorage<Record<string, TokenAccount>>(TOKEN_BALANCES_KEY, {});

    constructor() {
        this.tokenBalances = this._tokenBalances.current;
    };

    reset () {
        this.pubKeyString = defaultWalletState.pubKeyString;
        this.tokenBalances = this._tokenBalances.current;
    };
    
    getTokenBalance(mint: string): number {
        this.tokenBalances = this._tokenBalances.current;

        const cachedBalanceData = this.tokenBalances[mint];
        if (!cachedBalanceData) return 0;

        if (Date.now() - cachedBalanceData.lastUpdatedTimestamp > 30_000) {
            // remove from cache

            return 0;
        };

        return this.tokenBalances[mint].balance;
    };

    setTokenBalance(mint: string, balance: number): number {
        const newAccount: TokenAccount = {
            balance,
            lastUpdatedTimestamp: Date.now(),
        };

        const newTokenAccounts = { ...this._tokenBalances.current };
        newTokenAccounts[mint] = newAccount;
        
        this._tokenBalances.current = newTokenAccounts;
        this.tokenBalances = this._tokenBalances.current;

        return newAccount.balance;
    };
};

const WALLET_KEY = Symbol("WALLET");

export const setWalletState = () => {
    return setContext(WALLET_KEY, new WalletState());
};

export const getWalletState = () => {
    return getContext<ReturnType<typeof setWalletState>>(WALLET_KEY);
};