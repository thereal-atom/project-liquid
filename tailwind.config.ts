import type { Config } from "tailwindcss";

export default {
	content: [ "./src/**/*.{html,js,svelte,ts}" ],

	theme: {
		extend: {
            colors: {
                primary: "#15131C",
                secondary: "#c3c3ff",
                accent: "#635BFF",
                ["accent-secondary"]: "#B53C17",
            }
        }
	},
    safelist: [
        {
            pattern: /(bg|border)-(red|green|orange|blue|gray|yellow)-(200|500|900)/,
        },
    ],
	plugins: []
} satisfies Config;