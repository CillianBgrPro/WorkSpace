import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Kbd, { modKey } from '@/Components/ui/Kbd';

const SECTIONS = [
    {
        title: 'Général',
        items: [
            [[modKey, 'K'], 'Recherche et commandes'],
            [['?'], 'Afficher cette aide'],
            [['N'], 'Nouvelle tâche'],
            [['/'], 'Rechercher dans la page'],
        ],
    },
    {
        title: 'Navigation',
        items: [
            [['G', 'D'], 'Dashboard'],
            [['G', 'T'], 'Tâches'],
            [['G', 'C'], 'Calendrier'],
            [['G', 'B'], 'Budget'],
            [['G', 'E'], 'Équipes'],
            [['G', 'F'], 'Fichiers'],
            [['G', 'P'], 'Mes projets'],
        ],
    },
    {
        title: 'Formulaires',
        items: [
            [[modKey, '↵'], 'Enregistrer'],
            [['Échap'], 'Fermer une fenêtre'],
        ],
    },
];

export default function ShortcutsHelp({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-[65]">
            <DialogBackdrop transition className="fixed inset-0 bg-gray-900/40 transition-opacity duration-150 data-[closed]:opacity-0" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel transition className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0">
                    <div className="mb-4 flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold text-gray-900">Raccourcis clavier</DialogTitle>
                        <button onClick={onClose} className="-m-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Fermer">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {SECTIONS.map((section) => (
                            <div key={section.title} className={section.title === 'Navigation' ? 'sm:row-span-2' : ''}>
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.items.map(([keys, label]) => (
                                        <li key={label} className="flex items-center justify-between gap-4 text-sm text-gray-700">
                                            <span>{label}</span>
                                            <span className="flex items-center gap-1">
                                                {keys.map((k, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        {i > 0 && keys[0] === 'G' && <span className="text-xs text-gray-400">puis</span>}
                                                        <Kbd>{k}</Kbd>
                                                    </span>
                                                ))}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
