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
        // Ocean Gradient Dark Theme Backgrounds (Enhanced hierarchy)
        'bg-root': 'var(--bg-root)',
        'bg-surface-0': 'var(--bg-surface-0)', // NEW: sections, containers
        'bg-surface-1': 'var(--bg-surface-1)',
        'bg-surface-2': 'var(--bg-surface-2)',
        'bg-surface-3': 'var(--bg-surface-3)',

        // Typography (Enhanced)
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-accent': 'var(--text-accent)',
        'text-muted': 'var(--text-muted)',     // NEW: disabled states
        'text-inverse': 'var(--text-inverse)', // NEW: for light backgrounds

        // Borders (Enhanced)
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-hover': 'var(--border-hover)',   // NEW: hover state
        'border-focus': 'var(--border-focus)',
        'border-active': 'var(--border-active)', // NEW: active/selected

        // Primary accent colors (Star Command Blue)
        primary: 'var(--primary)',
        'primary-dim': 'var(--primary-dim)',
        'primary-hover': 'var(--primary-hover)',
        'primary-glow': 'var(--primary-glow)',

        // Secondary accent (Vibrant Cerulean)
        secondary: 'var(--secondary)',
        'secondary-dim': 'var(--secondary-dim)',

        // Highlight colors (Icy Sky)
        highlight: 'var(--highlight)',
        'highlight-dim': 'var(--highlight-dim)',

        // Light accent (Arctic Mist)
        'accent-light': 'var(--accent-light)',

        // Accent aliases (backwards compat)
        gold: 'var(--gold)',
        'gold-dim': 'var(--gold-dim)',
        'gold-border': 'var(--gold-border)',
        blue: 'var(--blue)',
        'blue-dim': 'var(--blue-dim)',
        cyan: 'var(--cyan)',
        'cyan-dim': 'var(--cyan-dim)',

        // Legacy compatibility
        fg: 'var(--foreground)',
        bg: 'var(--background)',

        // Status colors (Ocean-harmonized)
        error: 'var(--error)',
        'error-dim': 'var(--error-dim)',
        'error-border': 'var(--error-border)',
        success: 'var(--success)',
        'success-dim': 'var(--success-dim)',
        'success-border': 'var(--success-border)',
        warning: 'var(--warning)',           // NEW
        'warning-dim': 'var(--warning-dim)', // NEW
        'warning-border': 'var(--warning-border)', // NEW
      },

      accentColor: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'Arial', 'sans-serif'],
        title: ['var(--font-title)', 'var(--font-sans)', 'Arial', 'sans-serif'],
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
        glow: 'var(--shadow-glow)',
        inset: 'var(--shadow-inset)', // NEW: pressed states
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
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp var(--transition-slow-duration) var(--transition-timing-function) forwards',
        reveal: 'fadeInUp var(--transition-slow-duration) var(--transition-timing-function) var(--delay, 0s) forwards',
        'pulse-dark': 'pulseDark 2s infinite ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
