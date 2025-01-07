/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                glow: '0 0 20px #7dd3fc', // core star hover
                'glow-small': '0 0 4px #7dd3fc', // core star hover
                'glow-white': '0 0 8px white', // core star
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.8)', // Green glow
            },
        },
        fontFamily: {
            Rubik: ["Rubik"],
        }
    },
    plugins: [],
}