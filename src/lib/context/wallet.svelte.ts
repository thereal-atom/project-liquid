import { LocalStorage } from "$lib/utils/localStorage.svelte";
import { getContext, setContext } from "svelte";

const TOKEN_ACCOUNTS_KEY = "_pl_tokenAccounts";
const TOKEN_ACCOUNT_EXPIRY_TIME = 30_000;

const defaultWalletState = {
    pubKeyString: null,
};

interface TokenAccount {
    mint: string;
    balance: number;
    lastUpdatedTimestamp: number;
};

class WalletState {
    pubKeyString: string | null = $state(null);
    // object vs map? map is better but object is proxied but I don't really need this to be proxied in this case
    tokenAccounts: Map<string, TokenAccount> = $state(new Map());

    private _tokenAccounts = new LocalStorage<Map<string, TokenAccount>>(TOKEN_ACCOUNTS_KEY, new Map());

    constructor() {
        this.tokenAccounts = this._tokenAccounts.current;
    };

    reset () {
        this.pubKeyString = defaultWalletState.pubKeyString;
        this.tokenAccounts = this._tokenAccounts.current;
    };
    
    getTokenAccount(mint: string): TokenAccount | undefined {
        const now = Date.now();
        this._tokenAccounts.current.forEach((tokenAccount, key) => {
            if (tokenAccount.lastUpdatedTimestamp < now - TOKEN_ACCOUNT_EXPIRY_TIME) {
                this._tokenAccounts.current.delete(key);
            }
        });

        this.tokenAccounts = this._tokenAccounts.current;

        return this.tokenAccounts.get(mint); 
    };

    setTokenAccount(mint: string, accountInfo: { balance: number }): TokenAccount {
        const newAccount: TokenAccount = {
            mint,
            balance: accountInfo.balance,
            lastUpdatedTimestamp: Date.now(),
        };

        this._tokenAccounts.current.set(mint, newAccount); 
        this.tokenAccounts = this._tokenAccounts.current; 

        return newAccount;
    };
};

const WALLET_KEY = Symbol("WALLET");

export const setWalletState = () => {
    return setContext(WALLET_KEY, new WalletState());
};

export const getWalletState = () => {
    return getContext<ReturnType<typeof setWalletState>>(WALLET_KEY);
};