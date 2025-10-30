import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    DEFAULT: '#8B57A4',
                    dark: '#702E8A', // tom mais carregado
                    light: '#B07AC6', // tom mais claro
                },
                secondary: {
                    DEFAULT: '#E9E4E1',
                    dark: '#CFC7C3', // tom mais carregado
                    light: '#F4F1EE', // tom mais claro
                },
                tertiary: {
                    DEFAULT: '#E9E4E1',
                    dark: '#CFC7C3',
                    light: '#F4F1EE',
                },
            },
        },
    },

    plugins: [forms],
};
