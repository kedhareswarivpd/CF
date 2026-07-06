/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — unified "engineering teal" identity used across all four source pages
        brand: {
          DEFAULT: '#3D6268', // primary interactive color: CTAs, links, active states
          dark: '#2C3E41',    // deep teal-navy: footers, dark hero sections, strong headings
          light: '#5A7F86',   // lighter accent, used for secondary emphasis
          tint: '#7BA1A8',    // muted tint for icon backgrounds / borders
        },
        accent: {
          cyan: '#A7CDD5',    // "cyber-cyan" highlight, used on dark backgrounds
          'cyan-pale': '#E2F1F3', // pale cyan for chip/badge backgrounds on light surfaces
        },
        warning: '#FD5521',

        // Neutral surface scale (Material 3 tonal system from the Stitch exports)
        surface: {
          DEFAULT: '#F7F9FB',
          dim: '#D8DADC',
          bright: '#F7F9FB',
          low: '#F2F4F6',
          container: '#ECEEF0',
          high: '#E6E8EA',
          highest: '#E0E3E5',
          white: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#191C1E',   // on-surface (body text)
          muted: '#43474D',      // on-surface-variant (secondary text)
          inverse: '#EFF1F3',    // text on dark backgrounds
        },
        outline: {
          DEFAULT: '#74777E',
          variant: '#C4C6CE',
        },
        dark: {
          surface: { DEFAULT: '#1a1d21', dim: '#2a2d31', bright: '#1a1d21', low: '#222529', container: '#2a2d31', high: '#323539', highest: '#3a3d41', white: '#1a1d21' },
          ink: { DEFAULT: '#e8eaed', muted: '#9aa0a6', inverse: '#191c1e' },
          outline: { DEFAULT: '#5f6368', variant: '#3c4043' },
          brand: { DEFAULT: '#5A7F86', dark: '#3D6268', light: '#7BA1A8', tint: '#9BBBC2' },
        },
        status: {
          success: { bg: '#dcfce7', text: '#166534' },
          warning: { bg: '#fef3c7', text: '#92400e' },
          error: { bg: '#fee2e2', text: '#991b1b' },
          info: { bg: '#dbeafe', text: '#1e40af' },
          neutral: { bg: '#f3f4f6', text: '#4b5563' },
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        stat: ['Montserrat', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
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
        'stat-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'code-snippet': ['14px', { lineHeight: '20px', fontWeight: '400' }],
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
    },
  },
  plugins: [],
};
