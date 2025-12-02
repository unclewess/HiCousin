import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Palette
                'cousin-green': '#4CC38A',
                'cousin-yellow': '#FADB5F',
                'cousin-blue': '#60A5FA',
                'cousin-pink': '#FFA9C0',
                'cousin-purple': '#A78BFA',

                // Neutrals
                white: '#FFFFFF',
                'gray-light': '#F3F4F6',
                'gray-mid': '#9CA3AF',
                'gray-dark': '#4B5563',
                black: '#111827',

                // Semantics
                success: '#22C55E',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                secondary: ['var(--font-nunito)', 'sans-serif'],
                fun: ['var(--font-baloo)', 'cursive'],
            },
            borderRadius: {
                soft: '12px',
                rounded: '20px',
                pill: '999px',
            },

            boxShadow: {
                'soft-drop': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: [],
};
export default config;
