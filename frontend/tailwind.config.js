/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — unified "engineering teal" identity used across all four source pages
        brand: {
          DEFAULT: '#2563EB', // primary interactive color: CTAs, links, active states
          dark: '#0A2540',    // deep navy: footers, dark hero sections, strong headings
          light: '#3B82F6',   // lighter accent, used for secondary emphasis
          tint: '#93C5FD',    // muted tint for icon backgrounds / borders
        },
        accent: {
          cyan: '#00D4FF',    // bright cyan highlight for dark backgrounds
          'cyan-pale': '#E0F7FF', // pale cyan for chip/badge backgrounds on light surfaces
          red: '#EF4444',     // required-field asterisk / error emphasis
        },
        warning: '#FD5521',

        // Neutral surface scale — light mode is the spec-compliant default
        // (Background #F8FAFC / Primary #0A2540 text); dark mode (the
        // `dark:` variants below) keeps the deep-navy scheme.
        surface: {
          DEFAULT: '#F8FAFC',
          dim: '#EEF2F6',
          bright: '#FFFFFF',
          low: '#FFFFFF',
          container: '#EEF2F6',
          high: '#E2E8F0',
          highest: '#CBD5E1',
          white: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0A2540',   // on-surface (body text)
          muted: '#334155',     // on-surface-variant (secondary text)
          inverse: '#F8FAFC',   // text on dark accent sections (hero images, brand banners)
        },
        outline: {
          DEFAULT: '#93C5FD',
          variant: '#BFDBFE',
        },
        dark: {
          surface: { DEFAULT: '#0F172A', dim: '#0A2540', bright: '#0F172A', low: '#1E293B', container: '#1E293B', high: '#334155', highest: '#475569', white: '#1E293B' },
          ink: { DEFAULT: '#F8FAFC', muted: '#CBD5E1', inverse: '#0A2540' },
          outline: { DEFAULT: '#2563EB', variant: '#334155' },
          brand: { DEFAULT: '#2563EB', dark: '#0A2540', light: '#3B82F6', tint: '#93C5FD' },
        },
        status: {
          success: { DEFAULT: '#16A34A', bg: '#dcfce7', text: '#166534' },
          warning: { DEFAULT: '#F59E0B', bg: '#fef3c7', text: '#92400e' },
          error: { DEFAULT: '#DC2626', bg: '#fee2e2', text: '#991b1b' },
          danger: { DEFAULT: '#DC2626', bg: '#fee2e2', text: '#991b1b' },
          info: { DEFAULT: '#0EA5E9', bg: '#dbeafe', text: '#1e40af' },
          neutral: { bg: '#f3f4f6', text: '#4b5563' },
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        stat: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        'label-caps': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-xs': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'stat-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'code-snippet': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'display-md': ['28px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md-mobile': ['22px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        base: '8px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        'stack-xl': '48px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        'section-padding': '80px',
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        card: '0px 4px 20px rgba(10, 37, 64, 0.05)',
        'card-hover': '0px 12px 32px rgba(10, 37, 64, 0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
