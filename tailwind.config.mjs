// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          // Define your brand color
          'brand': {
            DEFAULT: '#047857',
            '50': '#ecfdf5',
            '100': '#d1fae5',
            '200': '#a7f3d0',
            '300': '#6ee7b7',
            '400': '#34d399',
            '500': '#10b981',
            '600': '#059669',
            '700': '#047857', // Your brand color
            '800': '#065f46',
            '900': '#064e3b',
            '950': '#022c22',
          },
        },
      },
    },
    plugins: [],
  };