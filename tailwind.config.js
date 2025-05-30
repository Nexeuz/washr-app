// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // This line includes all HTML and TypeScript files in the src folder
  ],
  theme: {
    extend: {
      // You can extend your theme here if needed
      fontFamily: {
        sans: ['"Space Grotesk"', '"Noto Sans"', 'sans-serif'], // Match your HTML
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional: useful for basic form styling reset
    // require('@tailwindcss/container-queries'), // Optional: if you used these
  ],
}