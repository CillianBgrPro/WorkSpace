import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#64748b', '#a855f7',
];

export default function CreateProjectModal({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        color: '#6366f1',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#0f0a2e] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Nouveau projet</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nom du projet <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Mon super projet..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Décrivez votre projet..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                        />
                    </div>

                    {/* Couleur */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Couleur du projet
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('color', color)}
                                    className={`w-8 h-8 rounded-full transition-all duration-200 ${
                                        data.color === color
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0a2e] scale-110'
                                            : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition disabled:opacity-50"
                            style={{ backgroundColor: data.color }}
                        >
                            {processing ? 'Création...' : 'Créer le projet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
