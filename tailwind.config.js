// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',

        fg: 'var(--foreground)',
        bg: 'var(--background)',

        darkDefault: 'var(--dark)',
        'dark-800': 'var(--dark-800)',
        'dark-600': 'var(--dark-600)',
        'dark-400': 'var(--dark-400)',

        lightDefault: 'var(--light)',
        'light-800': 'var(--light-800)',
        'light-600': 'var(--light-600)',
        'light-400': 'var(--light-400)',

        grayCustom: 'var(--gray)',

        error: 'var(--error-color)',
        'error-bg': 'var(--error-bg)',
        success: 'var(--success-color)',
        'success-bg': 'var(--success-bg)',
      },

      accentColor: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
      },

      fontFamily: {
        sans: ['var(--font-gilroy)', 'Arial', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      spacing: {
        'space-xs': 'var(--space-xs)',
        'space-sm': 'var(--space-sm)',
        'space-md': 'var(--space-md)',
        'space-lg': 'var(--space-lg)',
        'space-xl': 'var(--space-xl)',
        'space-xxl': 'var(--space-xxl)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        round: 'var(--radius-round)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        highlight: 'var(--shadow-highlight)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast-duration)',
        'medium': 'var(--transition-medium-duration)',
        'slow': 'var(--transition-slow-duration)',
      },
      transitionTimingFunction: {
        'custom-ease': 'var(--transition-timing-function)',
      },
      maxWidth: {
        'container': 'var(--container-width)',
        'form-max': '780px',
      },
      zIndex: {
        'overlay': 'var(--z-overlay)',
        'modal': 'var(--z-modal)',
        'nav': 'var(--z-nav)',
        'fixed': 'var(--z-fixed)',
        'dropdown': 'var(--z-dropdown)',
        'above': 'var(--z-above)',
        'normal': 'var(--z-normal)',
        'below': 'var(--z-below)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        pulseDark: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp var(--transition-slow-duration) var(--transition-timing-function) forwards',
        reveal: 'fadeInUp var(--transition-slow-duration) var(--transition-timing-function) var(--delay, 0s) forwards',
        'pulse-dark': 'pulseDark 2s infinite ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
