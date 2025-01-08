export const tooltip = (node: HTMLElement, params: { text: string }) => {
    return {
        update(newParams: { text: string }) {
            params = newParams;
        },
        destroy() {
            // node.removeEventListener();
        },
    };
};