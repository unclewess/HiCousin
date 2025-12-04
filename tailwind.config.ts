import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Playful color palette
                'cousin-purple': 'hsl(var(--cousin-purple))',
                'cousin-blue': 'hsl(var(--cousin-blue))',
                'cousin-pink': 'hsl(var(--cousin-pink))',
                'cousin-orange': 'hsl(var(--cousin-orange))',
                'cousin-green': 'hsl(var(--cousin-green))',
                // Existing custom colors
                white: '#FFFFFF',
                'gray-light': '#F3F4F6',
                'gray-mid': '#9CA3AF',
                'gray-dark': '#4B5563',
                black: '#111827',
                success: '#22C55E',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                soft: '12px',
                rounded: '20px',
                pill: '999px',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                secondary: ['var(--font-nunito)', 'sans-serif'],
                fun: ['var(--font-baloo)', 'cursive'],
                outfit: ['var(--font-outfit)', 'sans-serif'],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                wave: {
                    '0%, 60%, 100%': { transform: 'rotate(0.0deg)' },
                    '10%': { transform: 'rotate(14.0deg)' },
                    '20%': { transform: 'rotate(-8.0deg)' },
                    '30%': { transform: 'rotate(14.0deg)' },
                    '40%': { transform: 'rotate(-4.0deg)' },
                    '50%': { transform: 'rotate(10.0deg)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "wave": "wave 2.5s infinite",
                "shimmer": "shimmer 2s infinite linear",
            },
            boxShadow: {
                'soft-drop': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
