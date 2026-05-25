/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        night: {
          50:  '#f8fafc',
          100: '#edf4f2',
          200: '#dce8e3',
          300: '#bdd6ce',
          400: '#9dc3b7',
          500: '#7bbba2',
          600: '#5f9e84',
          700: '#407b60',
          800: '#2c5d48',
          900: '#1e3e32',
          950: '#152b24',
        },
        emerald: {
          brand: '#40c6a5',
          light: '#7be7ce',
          dark:  '#2d9b7f',
          glow:  '#40c6a520',
        },
        coral: {
          DEFAULT: '#ff6b61',
          light: '#ff8679',
          dark:  '#e55048',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'grid-pattern': "linear-gradient(rgba(26,134,105,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,134,105,0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
