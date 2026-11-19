import defaultTheme from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import forms from '@tailwindcss/forms';
import plugin from 'tailwindcss/plugin';

/*
 * Thème clair / sombre par variables CSS.
 * Chaque teinte (ex. gray-200) devient rgb(var(--c-gray-200)) : en mode sombre (.dark sur <html>),
 * les variables changent et toute l'interface suit, sans classes « dark: » à maintenir partout.
 */
const PALETTES = ['gray', 'indigo', 'rose', 'red', 'amber', 'emerald', 'sky', 'green', 'violet', 'blue', 'yellow', 'teal', 'orange', 'purple', 'pink'];
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const SURFACE = '#12151d'; // remplace le blanc des cartes en mode sombre

// Échelle de gris sombre dessinée à la main : fond, surfaces, bordures, puis textes de plus en plus clairs.
const DARK_GRAY = {
    50: '#0b0d12', 100: '#1a1f2b', 200: '#262c3a', 300: '#343b4c', 400: '#6b7385', 500: '#8a93a6',
    600: '#a9b1c2', 700: '#c9cfdb', 800: '#e1e5ec', 900: '#f1f3f7', 950: '#f8f9fb',
};

const hexToRgb = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (hex, base, amount) => {
    const a = hexToRgb(hex);
    const b = hexToRgb(base);
    return a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)));
};
const channels = (rgb) => (Array.isArray(rgb) ? rgb : hexToRgb(rgb)).join(' ');

// Accents en sombre : teintes de fond discrètes (50–300), textes éclaircis (700–950).
function darkAccent(palette, shade) {
    const c = colors[palette];
    switch (shade) {
        case 50: return mix(c[500], SURFACE, 0.12);
        case 100: return mix(c[500], SURFACE, 0.2);
        case 200: return mix(c[500], SURFACE, 0.32);
        case 300: return mix(c[400], SURFACE, 0.55);
        case 700: return hexToRgb(c[300]);
        case 800: return hexToRgb(c[200]);
        case 900: return hexToRgb(c[100]);
        case 950: return hexToRgb(c[50]);
        default: return hexToRgb(c[shade]);
    }
}

const themedColors = Object.fromEntries(
    PALETTES.map((p) => [p, Object.fromEntries(SHADES.map((s) => [s, `rgb(var(--c-${p}-${s}) / <alpha-value>)`]))]),
);

const themeVariables = plugin(({ addBase }) => {
    const light = {};
    const dark = { '--c-surface': channels(SURFACE) };
    for (const p of PALETTES) {
        for (const s of SHADES) {
            light[`--c-${p}-${s}`] = channels(colors[p][s]);
            dark[`--c-${p}-${s}`] = channels(p === 'gray' ? DARK_GRAY[s] : darkAccent(p, s));
        }
    }
    // .theme-fixed : zones déjà sombres par design (barre latérale, page Projets…) qui gardent leurs couleurs.
    addBase({ ':root, .theme-fixed': light, '.dark': dark, '.dark .theme-fixed': light });
});

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx}',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            colors: themedColors,
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms, themeVariables],
};
