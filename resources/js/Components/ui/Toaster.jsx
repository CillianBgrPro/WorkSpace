import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';

// Bus minimal : toast.success('…') depuis n'importe où, sans contexte React.
const listeners = new Set();
let counter = 0;

function emit(type, message, options = {}) {
    if (!message) return;
    const item = { id: ++counter, type, message, duration: options.duration ?? (type === 'error' ? 6000 : 3500) };
    listeners.forEach((fn) => fn(item));
}

export const toast = {
    success: (m, o) => emit('success', m, o),
    error: (m, o) => emit('error', m, o),
    info: (m, o) => emit('info', m, o),
};

const STYLES = {
    success: { icon: CheckCircleIcon, color: 'text-emerald-500' },
    error: { icon: ExclamationTriangleIcon, color: 'text-rose-500' },
    info: { icon: InformationCircleIcon, color: 'text-indigo-500' },
};

/** Affiche les messages flash du serveur après chaque navigation Inertia. */
export function emitFlash(flash) {
    if (!flash) return;
    if (flash.success) toast.success(flash.success);
    if (flash.error) toast.error(flash.error);
}

function ToastItem({ item, onClose }) {
    const [visible, setVisible] = useState(false);
    const { icon: Icon, color } = STYLES[item.type];

    useEffect(() => {
        const r = requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => setVisible(false), item.duration);
        return () => { cancelAnimationFrame(r); clearTimeout(t); };
    }, [item.duration]);

    useEffect(() => {
        if (visible) return;
        const t = setTimeout(onClose, 200);
        return () => clearTimeout(t);
    }, [visible]);

    return (
        <div
            role={item.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg ring-1 ring-black/5 transition duration-200 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
            <p className="flex-1 leading-5">{item.message}</p>
            <button onClick={() => setVisible(false)} className="-m-1 rounded p-1 text-gray-400 hover:text-white" aria-label="Fermer la notification">
                <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function Toaster({ initialFlash }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const add = (item) => setItems((prev) => [...prev.slice(-3), item]);
        listeners.add(add);
        emitFlash(initialFlash);

        const offSuccess = router.on('success', (event) => emitFlash(event.detail.page.props.flash));
        const offInvalid = router.on('invalid', (event) => {
            // En production, réponse non-Inertia (403/500…) : message clair plutôt que la page d'erreur brute.
            if (!import.meta.env.PROD) return;
            event.preventDefault();
            const status = event.detail.response?.status;
            toast.error(status === 403 ? "Vous n'avez pas les droits pour cette action." : 'Une erreur est survenue. Réessayez dans un instant.');
        });
        const offException = router.on('exception', () => toast.error('Connexion impossible. Vérifiez votre réseau.'));

        return () => { listeners.delete(add); offSuccess(); offInvalid(); offException(); };
    }, []);

    return (
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:right-6 md:left-auto md:items-end">
            {items.map((item) => (
                <ToastItem key={item.id} item={item} onClose={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} />
            ))}
        </div>
    );
}
