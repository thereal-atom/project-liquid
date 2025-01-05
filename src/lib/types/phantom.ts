import type { PublicKey } from "@solana/web3.js";

export interface PhantomProvider {
    isConnected: boolean;
    solana: {
        isPhantom: boolean;

        connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey}>;
        disconnect: () => Promise<void>;
        signAllTransactions: () => Promise<void>;
        signAndSendAllTransactions: () => Promise<void>;
        signTransaction: () => Promise<void>;
        signAndSendTransaction: () => Promise<void>;
        signMessage: () => Promise<void>;

        on: (event: "connect", cb: (publicKey: PublicKey) => void) => void;
    };
};