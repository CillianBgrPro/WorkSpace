import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import {
    UserCircleIcon, KeyIcon, AdjustmentsHorizontalIcon, CalendarDaysIcon, ExclamationTriangleIcon,
    SunIcon, MoonIcon, ComputerDesktopIcon, ClipboardDocumentIcon, ArrowPathIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import Field, { Input } from '@/Components/ui/Field';
import Avatar from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { confirmDialog } from '@/Components/ui/ConfirmDialog';
import { toast } from '@/Components/ui/Toaster';
import AuthField from '@/Components/Auth/AuthField';

function Section({ icon, title, description, children }) {
    return (
        <Card>
            <CardHeader icon={icon} title={title} description={description} />
            {children}
        </Card>
    );
}

function Toggle({ checked, onChange, label, description }) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <span>
                <span className="block text-sm font-medium text-gray-900">{label}</span>
                {description && <span className="block text-sm text-gray-500">{description}</span>}
            </span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
                <span className={`m-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`} />
            </button>
        </label>
    );
}

function ProfileInfo() {
    const user = usePage().props.auth.user;
    const { data, setData, patch, processing, errors, isDirty } = useForm({ name: user.name, email: user.email });

    return (
        <Section icon={UserCircleIcon} title="Informations" description="Votre nom apparaît sur vos tâches, commentaires et dans l'activité.">
            <form onSubmit={(e) => { e.preventDefault(); patch(route('profile.update'), { preserveScroll: true }); }} className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar name={data.name || user.name} size="lg" className="!h-14 !w-14 !text-lg" />
                    <p className="text-sm text-gray-500">Votre avatar reprend vos initiales.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom complet" required error={errors.name}>
                        {(p) => <Input {...p} value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" />}
                    </Field>
                    <Field label="Adresse e-mail" required error={errors.email} hint={data.email !== user.email ? 'Vous devrez confirmer la nouvelle adresse.' : undefined}>
                        {(p) => <Input {...p} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoComplete="email" />}
                    </Field>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" loading={processing} disabled={!isDirty}>Enregistrer</Button>
                </div>
            </form>
        </Section>
    );
}

function PasswordForm({ hasPassword, hasGoogle }) {
    const { data, setData, put, processing, errors, reset } = useForm({ current_password: '', password: '', password_confirmation: '' });
    const mismatch = data.password_confirmation && data.password !== data.password_confirmation;

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <Section
            icon={KeyIcon}
            title={hasPassword ? 'Mot de passe' : 'Définir un mot de passe'}
            description={hasPassword ? 'Utilisez au moins 8 caractères.' : 'Votre compte utilise Google. Ajoutez un mot de passe pour pouvoir aussi vous connecter avec votre e-mail.'}
        >
            {hasGoogle && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
                    Connexion avec Google activée
                </div>
            )}
            <form onSubmit={submit} className="space-y-4" noValidate>
                {hasPassword && (
                    <AuthField label="Mot de passe actuel" type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} autoComplete="current-password" error={errors.current_password} />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                    <AuthField label="Nouveau mot de passe" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" error={errors.password} />
                    <AuthField label="Confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" error={errors.password_confirmation || (mismatch ? 'Les mots de passe ne correspondent pas.' : null)} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" loading={processing} disabled={!data.password || mismatch}>{hasPassword ? 'Modifier le mot de passe' : 'Définir le mot de passe'}</Button>
                </div>
            </form>
        </Section>
    );
}

function Preferences({ preferences }) {
    const save = (patch) => router.patch(route('profile.preferences'), patch, { preserveScroll: true, preserveState: true });
    const themes = [
        ['light', 'Clair', SunIcon],
        ['dark', 'Sombre', MoonIcon],
        ['system', 'Système', ComputerDesktopIcon],
    ];

    return (
        <Section icon={AdjustmentsHorizontalIcon} title="Préférences">
            <div className="space-y-6">
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-900">Thème</p>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Thème">
                        {themes.map(([key, label, Icon]) => (
                            <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={preferences.theme === key}
                                onClick={() => save({ theme: key })}
                                className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                                    preferences.theme === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">« Système » suit le réglage clair/sombre de votre appareil.</p>
                </div>
                <Toggle
                    checked={preferences.email_notifications}
                    onChange={(v) => save({ email_notifications: v })}
                    label="Recevoir les rappels par e-mail"
                    description="Échéances du lendemain, rappels d'événements et invitations."
                />
            </div>
        </Section>
    );
}

function CalendarSync({ calendarUrl }) {
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        if (calendarUrl) {
            const ok = await confirmDialog({
                title: 'Générer un nouveau lien ?',
                message: "L'ancien lien cessera de fonctionner : les agendas qui l'utilisent ne se mettront plus à jour.",
                confirmLabel: 'Générer',
            });
            if (!ok) return;
        }
        router.post(route('profile.calendar-token'), {}, { preserveScroll: true });
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(calendarUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Copie impossible : sélectionnez le lien manuellement.');
        }
    };

    return (
        <Section icon={CalendarDaysIcon} title="Synchroniser avec votre agenda" description="Vos événements et les échéances de vos tâches, dans Google Agenda, Apple Calendrier ou Outlook.">
            {calendarUrl ? (
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input readOnly value={calendarUrl} onFocus={(e) => e.target.select()} className="font-mono text-xs" aria-label="Lien d'abonnement" />
                        <Button variant="secondary" icon={copied ? CheckIcon : ClipboardDocumentIcon} onClick={copy}>{copied ? 'Copié' : 'Copier'}</Button>
                    </div>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-gray-600">
                        <li><strong>Google Agenda</strong> : Autres agendas → « + » → À partir de l'URL → collez le lien.</li>
                        <li><strong>Apple Calendrier</strong> : Fichier → Nouvel abonnement à un calendrier.</li>
                        <li><strong>Outlook</strong> : Ajouter un calendrier → S'abonner à partir du web.</li>
                    </ol>
                    <p className="text-xs text-gray-500">Ce lien est personnel : ne le partagez pas. La mise à jour peut prendre quelques heures selon l'agenda.</p>
                    <Button variant="ghost" size="sm" icon={ArrowPathIcon} onClick={generate} className="-ml-2">Générer un nouveau lien</Button>
                </div>
            ) : (
                <Button icon={CalendarDaysIcon} onClick={generate}>Créer mon lien d'abonnement</Button>
            )}
        </Section>
    );
}

function DangerZone({ hasPassword, ownedProjects }) {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(false);
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '', confirmation: '' });

    const close = () => { setOpen(false); reset(); };

    return (
        <Card className="border-rose-200">
            <CardHeader icon={ExclamationTriangleIcon} title="Supprimer mon compte" description="Action définitive : vous perdrez l'accès à tous vos projets." />
            <Button variant="danger" onClick={() => setOpen(true)}>Supprimer mon compte…</Button>

            <Dialog open={open} onClose={close} className="relative z-[70]">
                <DialogBackdrop className="fixed inset-0 bg-gray-900/40" />
                <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
                    <DialogPanel
                        as="form"
                        onSubmit={(e) => { e.preventDefault(); destroy(route('profile.destroy'), { preserveScroll: true }); }}
                        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <DialogTitle className="text-base font-semibold text-gray-900">Supprimer définitivement votre compte ?</DialogTitle>
                        <div className="space-y-2 text-sm text-gray-600">
                            {ownedProjects.length > 0 ? (
                                <>
                                    <p>Ces projets dont vous êtes propriétaire seront <strong>supprimés pour tous leurs membres</strong> :</p>
                                    <div className="flex flex-wrap gap-1.5">{ownedProjects.map((n) => <Badge key={n} className="bg-rose-50 text-rose-700 ring-rose-200">{n}</Badge>)}</div>
                                </>
                            ) : <p>Vous n'êtes propriétaire d'aucun projet.</p>}
                            <p>Les tâches et fichiers que vous avez ajoutés aux projets des autres y resteront.</p>
                        </div>
                        {hasPassword ? (
                            <AuthField label="Mot de passe" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="current-password" autoFocus error={errors.password} />
                        ) : (
                            <Field label={`Tapez ${user.email} pour confirmer`} error={errors.confirmation}>
                                {(p) => <Input {...p} value={data.confirmation} onChange={(e) => setData('confirmation', e.target.value)} autoFocus autoComplete="off" />}
                            </Field>
                        )}
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button variant="secondary" onClick={close}>Annuler</Button>
                            <Button type="submit" variant="danger" loading={processing} disabled={hasPassword ? !data.password : data.confirmation !== user.email}>
                                Supprimer définitivement
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </Card>
    );
}

export default function ProfileEdit({ hasPassword, hasGoogle, preferences, calendarUrl, ownedProjects = [] }) {
    return (
        <AppLayout header="Mon compte">
            <Head title="Mon compte" />
            <PageHeader title="Mon compte" description="Gérez vos informations, votre sécurité et vos préférences." />
            <div className="max-w-3xl space-y-5">
                <ProfileInfo />
                <PasswordForm hasPassword={hasPassword} hasGoogle={hasGoogle} />
                <Preferences preferences={preferences} />
                <CalendarSync calendarUrl={calendarUrl} />
                <DangerZone hasPassword={hasPassword} ownedProjects={ownedProjects} />
            </div>
        </AppLayout>
    );
}
