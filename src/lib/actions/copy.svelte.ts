import { getToasterState } from "$lib/context/toaster.svelte";

export const copy = (node: HTMLElement, params: { text: string }) => {
    // todo: check if this is fine to do?
    // this works but is it good practice?
    // in theory this only runs on the client because 'copy' will only happen on the client (from buttons etc)
    const toaster = getToasterState();

    const handleClick = () => {
        navigator.clipboard.writeText(params.text)
            .then(() => {
                console.log(`copied ${params.text}`);

                toaster.add({
                    title: "Copied to clipboard",
                    message: params.text,
                    type: "success",
                });
            })
            .catch(err => {
                console.error("Failed to copy: ", err);
            });
    };

    node.addEventListener("click", handleClick);

    // todo: use runes instead of update() and destroy()

    return {
        update(newParams: { text: string }) {
            params = newParams;
        },
        destroy() {
            node.removeEventListener("click", handleClick);
        },
    };
};