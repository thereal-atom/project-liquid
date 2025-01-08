import { tick } from "svelte";
import { isClient, isLocal } from "./common"

export class LocalStorage<T> {
	#key: string;
	#version = $state(0);
	#listeners = 0;
	#value: T | undefined;

	#handler = (e: StorageEvent) => {
		if (e.storageArea !== localStorage) return;
		if (e.key !== this.#key) return;

		this.#version += 1;
	};

	constructor(key: string, initial?: T) {
		this.#key = key;
		this.#value = initial;

		if (typeof localStorage !== "undefined") {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(initial));
			}
		}
	}

	get current(): T {
		const root =
			typeof localStorage !== "undefined"
				? JSON.parse(localStorage.getItem(this.#key) as any)
				: this.#value;

		const proxies = new WeakMap();

		const proxy = (value: unknown) => {
			if (typeof value !== "object" || value === null) {
				return value;
			}

			let p = proxies.get(value);

			if (!p) {
				p = new Proxy(value, {
					get: (target, property) => {
						return proxy(Reflect.get(target, property));
					},
					set: (target, property, value) => {
						this.#version += 1;
						Reflect.set(target, property, value);

						if (typeof localStorage !== "undefined") {
							localStorage.setItem(this.#key, JSON.stringify(root));
						}

						return true;
					}
				});

				proxies.set(value, p);
			}

			return p;
		};

		if ($effect.tracking()) {
			$effect(() => {
				if (this.#listeners === 0) {
					window.addEventListener("storage", this.#handler);
				}

				this.#listeners += 1;

				return () => {
					tick().then(() => {
						this.#listeners -= 1;
						if (this.#listeners === 0) {
							window.removeEventListener("storage", this.#handler);
						}
					});
				};
			});
		}

		return proxy(root);
	};

	set current(value) {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(this.#key, JSON.stringify(value));
		};

		this.#version += 1;
	};
};

export const getStorageItem = (key: string): string | null => {
    if (!isClient()) return null;

    return localStorage.getItem(key);
};

export const setStorageItem = (key: string, value: string | number): void => {
    if (!isClient()) return;

    return localStorage.setItem(key, String(value));
};

export const deleteStorageItem = (key: string): void => {
    if (!isClient()) return;

    return localStorage.removeItem(key);
};

export const getDevOnlyStorage = (key: string): string | null => {
    if (!isClient() || !isLocal()) return null;
    
    return localStorage.getItem(key);
};