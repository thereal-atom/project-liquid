import { getContext, setContext } from "svelte";

const defaultWalletState = {
    pubKey: null,
    balance: 0,
};

class WalletState {
    pubKey: string | null = $state(null);
    balance: number = $state(0);

    constructor() {};

    reset () {
        this.pubKey = defaultWalletState.pubKey;
        this.balance = defaultWalletState.balance;
    };
};

const WALLET_KEY = Symbol("WALLET");

export const setWalletState = () => {
    return setContext(WALLET_KEY, new WalletState());
};

export const getWalletState = () => {
    return getContext<ReturnType<typeof setWalletState>>(WALLET_KEY);
};

// todo: look at this: https://docs.phantom.com/phantom-deeplinks/handling-sessions (for deeplinks)
// todo: look at this for types: https://github.com/anza-xyz/wallet-adapter/blob/master/packages/core/base/src/adapter.ts