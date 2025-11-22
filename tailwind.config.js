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
        // Navy Prestige Backgrounds
        'bg-root': 'var(--bg-root)',
        'bg-surface-1': 'var(--bg-surface-1)',
        'bg-surface-2': 'var(--bg-surface-2)',
        'bg-surface-3': 'var(--bg-surface-3)',

        // Navy Prestige Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-accent': 'var(--text-accent)',

        // Navy Prestige Borders
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',

        // Navy Prestige Accents
        gold: 'var(--gold)',
        'gold-dim': 'var(--gold-dim)',
        'gold-border': 'var(--gold-border)',
        blue: 'var(--blue)',
        'blue-dim': 'var(--blue-dim)',

        // Legacy compatibility
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
        sans: ['var(--font-sans)', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
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
        // Background & Content Layers
        'below': 'var(--z-below)',
        'normal': 'var(--z-normal)',
        'above': 'var(--z-above)',

        // Page Structure - Persistent Elements
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',

        // Interactive Overlays - Contextual UI
        'dropdown': 'var(--z-dropdown)',
        'tooltip': 'var(--z-tooltip)',
        'nav': 'var(--z-nav)',

        // Blocking Overlays - Full Page Interactions
        'overlay': 'var(--z-overlay)',
        'modal': 'var(--z-modal)',
        'toast': 'var(--z-toast)',
        'loading': 'var(--z-loading)',
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
