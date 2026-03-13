/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#EFF6FF',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#EEF2FF',
        },
        brand: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#C0C5CC',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          text: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          text: '#991B1B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.12), 0 1px 3px -1px rgba(0,0,0,0.10)',
        sm:   '0 2px 6px 0 rgba(0,0,0,0.10), 0 1px 3px -1px rgba(0,0,0,0.08)',
        md:   '0 5px 10px -1px rgba(0,0,0,0.12), 0 3px 6px -2px rgba(0,0,0,0.08)',
        lg:   '0 12px 20px -3px rgba(0,0,0,0.12), 0 5px 8px -4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
