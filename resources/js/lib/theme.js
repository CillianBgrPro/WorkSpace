// Applique le thème (clair / sombre / système) sur <html>.
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
let current = 'system';

export function applyTheme(theme = 'system') {
    current = theme;
    const dark = theme === 'dark' || (theme === 'system' && media?.matches);
    document.documentElement.classList.toggle('dark', !!dark);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0d12' : '#0f0a2e');
}

// Suit le réglage de l'appareil quand le thème est « système ».
media?.addEventListener('change', () => { if (current === 'system') applyTheme('system'); });
