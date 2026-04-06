import colors from 'tailwindcss/colors';

/**
 * Design tokens
 * primary — public-facing site color  (change 1 line to retheme)
 * admin   — admin portal color        (change 1 line to retheme)
 */
const primary = colors.teal;    // e.g. colors.indigo, colors.violet, colors.sky
const admin   = colors.indigo;  // e.g. colors.blue, colors.slate, colors.violet

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary,
        admin,
      },
    },
  },
  plugins: [],
};
