export const isClient = () => typeof window !== "undefined";
export const isLocal = () => typeof window !== "undefined" && window.location.host.includes("localhost");

export const truncateString = (string: string, startLength: number, endLength: number, filler: string = "…") => {
    if (string.length <= startLength + endLength) {
        return string;
    };

    return `${string.slice(0, startLength)}${filler}${string.slice(-endLength)}`;
};

export const debounce = (fn: (params?: any) => void, delay?: number) => {
    let timer: number | null = null
  
    return (params?: any) => {
        timer && clearTimeout(timer);
        
        timer = window.setTimeout(() => {
            fn(params);
        }, delay || 250)
    };
};