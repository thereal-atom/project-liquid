export const getPhantomProvider = () => {
    if ("phantom" in window) {
        const phantomProvider = window.phantom?.solana;
  
        if (phantomProvider?.isPhantom) {
            return phantomProvider;
        };
    };
  
    window.open("https://phantom.app/", "_blank");
};

export const connectPhantomWallet = async () => {
    const phantomProvider = getPhantomProvider();
    if (!phantomProvider) {
        throw new Error("Phantom Wallet not found.");
    };

    await phantomProvider.connect();
};