import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Toaster from '@/Components/ui/Toaster';
import ConfirmHost from '@/Components/ui/ConfirmDialog';

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
