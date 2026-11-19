import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Toaster from '@/Components/ui/Toaster';
import ConfirmHost from '@/Components/ui/ConfirmDialog';
import { router } from '@inertiajs/react';
import { applyTheme } from '@/lib/theme';

const appName = import.meta.env.VITE_APP_NAME || 'WorkSpace';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        applyTheme(props.initialPage.props.auth?.user?.theme ?? 'system');
        // « success » couvre aussi les visites qui gardent la même URL (ex. changement de préférence).
        const syncTheme = (event) => applyTheme(event.detail.page.props.auth?.user?.theme ?? 'system');
        router.on('success', syncTheme);
        router.on('navigate', syncTheme);

        root.render(
            <>
                <App {...props} />
                <Toaster initialFlash={props.initialPage.props.flash} />
                <ConfirmHost />
            </>,
        );
    },
    progress: {
        color: '#6366f1',
        delay: 150,
    },
});

// Application installable (PWA) : enregistrement du service worker en production.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
