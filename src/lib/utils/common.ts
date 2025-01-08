export const isClient = () => typeof window !== "undefined";
export const isLocal = () => typeof window !== "undefined" && window.location.host.includes("localhost");

export const truncateString = (string: string, startLength: number, endLength: number, filler: string = "…") => {
    if (string.length <= startLength + endLength) {
        return string;
    };

    return `${string.slice(0, startLength)}${filler}${string.slice(-endLength)}`;
};