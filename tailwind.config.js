/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  // future: {
  //   hoverOnlyWhenSupported: true,
  // },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        current: 'var(--text-color)',
        light: 'var(--bg-color)',
        dark: 'var()',
        darkGreen: '#222325',
        iridium: '#3C3C3D',
        gunmetal: '#2F3033',
        santaGrey: '#98A2B3',
        dodgerBlue: '#4480F7',
        paleRed: '#DF4F45',
        riverBed: '#475467',
        dodgeBlue: '#4480F7',
        night: '#0B0B0B',
        thunder: '#2F2F2F',
        mistBlue: '#667085',
      },
      textColor: {
        skin: {
          base: 'var(--text-color)',
        },
      },
      backgroundColor: {
        skin: {
          base: 'var(--bg-color)',
        },
      },

      // backgroundImage: ({ theme }) => ({
      //   'vc-border-gradient': `radial-gradient(at left top, ${theme(
      //     'colors.gray.500',
      //   )}, 50px, ${theme('colors.gray.800')} 50%)`,
      // }),
      keyframes: ({ theme }) => ({
        rerender: {
          '0%': {
            ['border-color']: theme('colors.vercel.pink'),
          },
          '40%': {
            ['border-color']: theme('colors.vercel.pink'),
          },
        },
        highlight: {
          '0%': {
            background: theme('colors.vercel.pink'),
            color: theme('colors.white'),
          },
          '40%': {
            background: theme('colors.vercel.pink'),
            color: theme('colors.white'),
          },
        },
        loading: {
          '0%': {
            opacity: '.2',
          },
          '20%': {
            opacity: '1',
            transform: 'translateX(1px)',
          },
          to: {
            opacity: '.2',
          },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        translateXReset: {
          '100%': {
            transform: 'translateX(0)',
          },
        },
        fadeToTransparent: {
          '0%': {
            opacity: '1',
          },
          '40%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
      }),
      maxWidth: {
        50: '50%',
        60: '60%',
        70: '70%',
        80: '80%',
        90: '90%',
      },
      minWidth: {
        50: '50%',
        60: '60%',
        70: '70%',
        80: '80%',
        90: '90%',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
