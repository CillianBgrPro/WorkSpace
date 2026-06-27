import { useState } from 'react';
import { router } from '@inertiajs/react';
import { XMarkIcon, TrashIcon, CalendarDaysIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const TYPES = [
    { value: 'event', label: 'Événement', color: '#2563eb', icon: CalendarDaysIcon },
    { value: 'meeting', label: 'Réunion', color: '#7c3aed', icon: UsersIcon },
    { value: 'deadline', label: 'Deadline', color: '#dc2626', icon: ExclamationTriangleIcon },
];

export default function EventModal({ event, defaultDate, users, teams, currentUserId, onClose }) {
    const isEdit = !!event?.id;

    const [form, setForm] = useState({
        title: event?.title ?? '',
        description: event?.description ?? '',
        type: event?.type ?? 'event',
        start_at: event?.start_at?.slice(0, 16) ?? (defaultDate ? `${defaultDate}T09:00` : ''),
        end_at: event?.end_at?.slice(0, 16) ?? '',
        all_day: event?.all_day ?? false,
        reminder: event?.reminder ?? false,
        reminder_minutes: event?.reminder_minutes ?? 30,
        participants: event?.participants ?? [],
        teams: event?.teams?.map(t => t.id) ?? [],
        color: event?.color ?? '#2563eb',
    });

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const toggleParticipant = (id) => {
        set('participants', form.participants.includes(id)
            ? form.participants.filter(p => p !== id)
            : [...form.participants, id]
        );
    };

    const toggleTeam = (id) => {
        set('teams', form.teams.includes(id)
            ? form.teams.filter(t => t !== id)
            : [...form.teams, id]
        );
    };

    const submit = () => {
        const payload = { ...form };
        if (isEdit) {
            router.patch(route('calendar.update', event.id), payload, {
                onSuccess: onClose,
                preserveScroll: true,
            });
        } else {
            router.post(route('calendar.store'), payload, {
                onSuccess: onClose,
                preserveScroll: true,
            });
        }
    };

    const destroy = () => {
        if (!confirm('Supprimer cet événement ?')) return;
        router.delete(route('calendar.destroy', event.id), {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
                    </h2>
                    <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    {/* Titre */}
                    <input
                        type="text"
                        placeholder="Titre *"
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    {/* Type */}
                    <div className="flex gap-2">
                        {TYPES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => { set('type', t.value); set('color', t.color); }}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition
                                    ${form.type === t.value ? 'text-white border-transparent' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                style={form.type === t.value ? { backgroundColor: t.color } : {}}
                            >
                                <t.icon className="w-3.5 h-3.5 inline-block mr-1" />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <input type="checkbox" checked={form.all_day} onChange={e => set('all_day', e.target.checked)} />
                            Journée entière
                        </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Début *</label>
                            <input
                                type={form.all_day ? 'date' : 'datetime-local'}
                                value={form.start_at}
                                onChange={e => set('start_at', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400">Fin</label>
                            <input
                                type={form.all_day ? 'date' : 'datetime-local'}
                                value={form.end_at}
                                onChange={e => set('end_at', e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <textarea
                        placeholder="Description (optionnelle)"
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={2}
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    {/* Participants */}
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Equipes</label>
                        <div className="flex flex-wrap gap-2">
                            {teams.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => toggleTeam(team.id)}
                                    className={`px-2 py-1 rounded-full text-xs border transition
                                        ${form.teams.includes(team.id)
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {team.name}
                                </button>
                            ))}
                        </div>
                        {teams.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Aucune equipe disponible.</p>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Participants</label>
                        <div className="flex flex-wrap gap-2">
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => toggleParticipant(u.id)}
                                    disabled={u.id === currentUserId}
                                    className={`px-2 py-1 rounded-full text-xs border transition
                                        ${form.participants.includes(u.id)
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {u.id === currentUserId ? `${u.name} (moi)` : u.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rappel */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                            <input type="checkbox" checked={form.reminder} onChange={e => set('reminder', e.target.checked)} />
                            Rappel
                        </label>
                        {form.reminder && (
                            <select
                                value={form.reminder_minutes}
                                onChange={e => set('reminder_minutes', Number(e.target.value))}
                                className="border rounded-lg px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value={15}>15 minutes avant</option>
                                <option value={30}>30 minutes avant</option>
                                <option value={60}>1 heure avant</option>
                                <option value={1440}>1 jour avant</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between mt-6">
                    {isEdit ? (
                        <button onClick={destroy} className="flex items-center gap-1 text-sm text-red-600 hover:underline">
                            <TrashIcon className="w-4 h-4" /> Supprimer
                        </button>
                    ) : <div />}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:underline">
                            Annuler
                        </button>
                        <button
                            onClick={submit}
                            disabled={!form.title || !form.start_at}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isEdit ? 'Enregistrer' : 'Créer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}