import type { ToastOptions, Toast } from "$lib/types/toasts";
import { getContext, onDestroy, setContext } from "svelte";

class ToasterState {
    toasts = $state<Toast[]>([]);
    toastToTimeoutMap = new Map<string, number>();

    constructor() {
        onDestroy(() => {
            for (const timeout of this.toastToTimeoutMap.values()) {
                clearTimeout(timeout);
            }
            this.toastToTimeoutMap.clear();
        });
    };

    add(options: ToastOptions, durationMs = 5000) {
        const id = crypto.randomUUID();
        this.toasts.push({
            id,
            ...options,
            type: options.type || "info",
        });

        this.toastToTimeoutMap.set(
            id,
            setTimeout(() => {
                this.remove(id);
            }, durationMs)
        );
    };

    remove(id: string) {
        const timeout = this.toastToTimeoutMap.get(id);
        if (timeout) {
            clearTimeout(timeout);
            this.toastToTimeoutMap.delete(id);
        };

        this.toasts = this.toasts.filter((toast) => toast.id !== id);
    };
};

const TOASTER_KEY = Symbol("TOASTER");

export const setToasterState = () => {
    return setContext(TOASTER_KEY, new ToasterState());
};

export const getToasterState = () => {
    return getContext<ReturnType<typeof setToasterState>>(TOASTER_KEY);
};