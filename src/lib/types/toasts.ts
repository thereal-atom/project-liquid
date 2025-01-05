export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
    title: string;
    message?: string;
    type?: ToastType;
};

export interface Toast {
	id: string;
	title: string;
	message?: string;
    type: ToastType;
};
