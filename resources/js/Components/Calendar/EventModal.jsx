import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, TrashIcon, CalendarDaysIcon, UsersIcon, FlagIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/16/solid';
import Field, { Input, Textarea, Select } from '@/Components/ui/Field';
import Button from '@/Components/ui/Button';
import Avatar from '@/Components/ui/Avatar';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { modKey } from '@/Components/ui/Kbd';

const TYPES = [
    { value: 'event', label: 'Événement', color: '#2563eb', icon: CalendarDaysIcon },
    { value: 'meeting', label: 'Réunion', color: '#7c3aed', icon: UsersIcon },
    { value: 'deadline', label: 'Échéance', color: '#dc2626', icon: FlagIcon },
];

const pad = (n) => String(n).padStart(2, '0');

/** Ajoute une heure à « AAAA-MM-JJTHH:mm ». */
function plusOneHour(value) {
    if (!value || value.length < 16) return '';
    const d = new Date(value);
    if (isNaN(d)) return '';
    d.setHours(d.getHours() + 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Chip({ selected, disabled, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={selected}
            className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium ring-1 ring-inset transition disabled:cursor-default ${
                selected ? 'bg-indigo-50 text-indigo-700 ring-indigo-200' : 'bg-white text-gray-600 ring-gray-200 hover:ring-gray-300'
            }`}
        >
            {children}
            {selected && <CheckIcon className="h-3.5 w-3.5" />}
        </button>
    );
}

export default function EventModal({ event, defaultDate, users, teams, currentUserId, onClose }) {
    const isEdit = !!event?.id;
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const initialStart = event?.start_at?.slice(0, event?.all_day ? 10 : 16) ?? (defaultDate ? `${defaultDate}T09:00` : '');
    const [form, setForm] = useState({
        title: event?.title ?? '',
        description: event?.description ?? '',
        type: event?.type ?? 'event',
        start_at: initialStart,
        end_at: event?.end_at?.slice(0, event?.all_day ? 10 : 16) ?? (isEdit ? '' : plusOneHour(initialStart)),
        all_day: event?.all_day ?? false,
        reminder: event?.reminder ?? false,
        reminder_minutes: event?.reminder_minutes ?? 30,
        participants: event?.participants ?? [currentUserId],
        teams: event?.teams?.map((t) => t.id) ?? [],
        color: event?.color ?? '#2563eb',
    });

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
    const toggle = (key, id) => set(key, form[key].includes(id) ? form[key].filter((x) => x !== id) : [...form[key], id]);

    const setStart = (value) => {
        setForm((f) => {
            // Si la fin n'a pas été touchée (ou devient antérieure), on la cale une heure après.
            const autoEnd = !f.all_day && (!f.end_at || f.end_at <= value) ? plusOneHour(value) : f.end_at;
            return { ...f, start_at: value, end_at: autoEnd };
        });
    };

    const setAllDay = (allDay) => {
        setForm((f) => ({
            ...f,
            all_day: allDay,
            start_at: allDay ? f.start_at.slice(0, 10) : f.start_at ? `${f.start_at.slice(0, 10)}T09:00` : '',
            end_at: allDay ? f.end_at.slice(0, 10) : f.end_at ? `${f.end_at.slice(0, 10)}T10:00` : '',
        }));
    };

    const submit = (e) => {
        e?.preventDefault();
        const options = {
            preserveScroll: true,
            onStart: () => setSaving(true),
            onFinish: () => setSaving(false),
            onSuccess: onClose,
            onError: setErrors,
        };
        if (isEdit) router.patch(route('calendar.update', event.id), form, options);
        else router.post(route('calendar.store'), form, options);
    };

    const destroy = async () => {
        if (await confirmDelete(`l'événement « ${event.title} »`)) {
            router.delete(route('calendar.destroy', event.id), { preserveScroll: true, onSuccess: onClose });
        }
    };

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <DialogBackdrop transition className="fixed inset-0 bg-gray-900/40 transition-opacity duration-150 data-[closed]:opacity-0" />
            <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
                <DialogPanel
                    as="form"
                    onSubmit={submit}
                    transition
                    className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl transition duration-150 data-[closed]:translate-y-6 data-[closed]:opacity-0 sm:rounded-2xl"
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <DialogTitle className="text-base font-semibold text-gray-900">
                            {isEdit ? "Modifier l'événement" : 'Nouvel événement'}
                        </DialogTitle>
                        <button type="button" onClick={onClose} className="-m-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Fermer">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                        <Field label="Titre" required error={errors.title}>
                            {(p) => <Input {...p} data-autofocus autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Point d'équipe hebdomadaire" />}
                        </Field>

                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1" role="radiogroup" aria-label="Type">
                            {TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={form.type === t.value}
                                    onClick={() => setForm((f) => ({ ...f, type: t.value, color: t.color }))}
                                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                                        form.type === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    <t.icon className="h-4 w-4" style={form.type === t.value ? { color: t.color } : undefined} />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={form.all_day} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                            Toute la journée
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field label="Début" required error={errors.start_at}>
                                {(p) => <Input {...p} type={form.all_day ? 'date' : 'datetime-local'} value={form.start_at} onChange={(e) => setStart(e.target.value)} />}
                            </Field>
                            <Field label="Fin" error={errors.end_at}>
                                {(p) => <Input {...p} type={form.all_day ? 'date' : 'datetime-local'} value={form.end_at} min={form.start_at} onChange={(e) => set('end_at', e.target.value)} />}
                            </Field>
                        </div>

                        <Field label="Description" optional error={errors.description}>
                            {(p) => <Textarea {...p} rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ordre du jour, lien de visio…" />}
                        </Field>

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-gray-700">Participants</p>
                            <div className="flex flex-wrap gap-1.5">
                                {users.map((u) => (
                                    <Chip key={u.id} selected={form.participants.includes(u.id)} disabled={u.id === currentUserId} onClick={() => toggle('participants', u.id)}>
                                        <Avatar name={u.name} size="xs" className="ring-0" />
                                        {u.id === currentUserId ? `${u.name} (moi)` : u.name}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        {teams.length > 0 && (
                            <div>
                                <p className="mb-1.5 text-sm font-medium text-gray-700">Équipes</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {teams.map((team) => (
                                        <Chip key={team.id} selected={form.teams.includes(team.id)} onClick={() => toggle('teams', team.id)}>
                                            <UsersIcon className="ml-1 h-3.5 w-3.5" />
                                            {team.name}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" checked={form.reminder} onChange={(e) => set('reminder', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                                Me le rappeler
                            </label>
                            {form.reminder && (
                                <Select value={form.reminder_minutes} onChange={(e) => set('reminder_minutes', Number(e.target.value))} className="w-auto" aria-label="Délai du rappel">
                                    <option value={15}>15 min avant</option>
                                    <option value={30}>30 min avant</option>
                                    <option value={60}>1 h avant</option>
                                    <option value={1440}>1 jour avant</option>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                        {isEdit && (
                            <Button variant="danger-ghost" size="sm" icon={TrashIcon} onClick={destroy}>Supprimer</Button>
                        )}
                        <span className="ml-auto hidden text-xs text-gray-400 sm:inline">{modKey} + ↵</span>
                        <Button variant="secondary" onClick={onClose}>Annuler</Button>
                        <Button type="submit" loading={saving} disabled={!form.title.trim() || !form.start_at}>
                            {isEdit ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
