import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { ExclamationTriangleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

// File d'attente globale : `await confirmDialog({...})` renvoie true / false.
let open = null;

export function confirmDialog(options) {
    return new Promise((resolve) => {
        if (!open) {
            // Repli si l'hôte n'est pas monté (ne devrait pas arriver).
            resolve(window.confirm(options.message || options.title));
            return;
        }
        open({ ...options, resolve });
    });
}

/** Raccourci pour les suppressions : `if (await confirmDelete('la tâche « X »')) …` */
export const confirmDelete = (what, extra) =>
    confirmDialog({
        title: `Supprimer ${what} ?`,
        message: extra ?? 'Cette action est définitive.',
        confirmLabel: 'Supprimer',
        danger: true,
    });

export default function ConfirmHost() {
    const [state, setState] = useState(null);
    const confirmRef = useRef(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        open = (opts) => setState(opts);
        return () => { open = null; };
    }, []);

    const close = (value) => {
        state?.resolve(value);
        setState(null);
    };

    const danger = state?.danger;
    const Icon = danger ? ExclamationTriangleIcon : QuestionMarkCircleIcon;

    return (
        <Dialog open={!!state} onClose={() => close(false)} className="relative z-[70]" initialFocus={state?.danger ? cancelRef : confirmRef}>
            <DialogBackdrop transition className="fixed inset-0 bg-gray-900/40 transition-opacity duration-150 data-[closed]:opacity-0" />
            <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl transition duration-150 data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:p-6 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
                >
                    <div className="flex gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 pt-1">
                            <DialogTitle className="text-base font-semibold text-gray-900">{state?.title}</DialogTitle>
                            {state?.message && <p className="mt-1.5 whitespace-pre-line text-sm text-gray-500">{state.message}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button ref={cancelRef} variant="secondary" onClick={() => close(false)}>
                            {state?.cancelLabel ?? 'Annuler'}
                        </Button>
                        <Button ref={confirmRef} variant={danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                            {state?.confirmLabel ?? 'Confirmer'}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
