/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            keyframes: {
                spanFromLeft: {
                    from: { width: '0%' },
                    to: { width: '100%' },
                },
            },
            animation: {
                'span-from-left': 'spanFromLeft 0.3s ease',
            },
            colors: {
                'nav-border': 'rgb(241 245 249)',
                spacer: 'rgb(203 213 225)',
                description: 'rgb(100 116 139)',
                'no-result': 'rgb(156 163 175)',
            },
        },
    },
    plugins: [require('daisyui'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
    daisyui: {
        themes: false,
    },
};
