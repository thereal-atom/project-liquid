declare interface Window {
    phantom: {
        isConnected: boolean;
        solana: {
            isPhantom: boolean;
    
            connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey }>;
            disconnect: () => Promise<void>;
            signTransaction: (transaction) => Promise<any>;
            signAndSendTransaction: (transaction) => Promise<any>;
            signAllTransactions: (transactions) => Promise<any>;
            signAndSendAllTransactions: (transactions) => Promise<any>;
            signMessage: (message: Uint8Array) => Promise<any>;
    
            on: (event: "connect", cb: (publicKey) => void) => void;
        };
    };
};