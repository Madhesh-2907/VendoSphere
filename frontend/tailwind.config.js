/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A', // Deep Slate Blue
          dark: '#1E293B',
          light: '#3B82F6',
        },
        secondary: {
          DEFAULT: '#0F766E', // Teal
          dark: '#115E59',
          light: '#14B8A6',
        },
        accent: {
          DEFAULT: '#7C3AED', // Purple
          dark: '#6D28D9',
          light: '#8B5CF6',
        },
        success: {
          DEFAULT: '#10B981', // Emerald
          dark: '#059669',
          light: '#34D399',
        },
        background: '#F8FAFC',
      },
    },
  },
  plugins: [],
};
