declare interface Window {
    phantom: {
        isConnected: boolean;
        solana: {
            isPhantom: boolean;
    
            connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey }>;
            disconnect: () => Promise<void>;
            signTransaction: (transaction) => Promise<void>;
            signAndSendTransaction: (transaction) => Promise<void>;
            signAllTransactions: (transactions) => Promise<void>;
            signAndSendAllTransactions: (transactions) => Promise<void>;
            signMessage: (message: Uint8Array) => Promise<void>;
    
            on: (event: "connect", cb: (publicKey) => void) => void;
        };
    };
};