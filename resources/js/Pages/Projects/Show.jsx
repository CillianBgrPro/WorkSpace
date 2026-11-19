import { useEffect, useRef, useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    UserPlusIcon, XMarkIcon, EnvelopeIcon, ArrowRightIcon, ArrowPathIcon, ClockIcon, ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import { Input, Select, FieldError } from '@/Components/ui/Field';
import Avatar from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { confirmDialog } from '@/Components/ui/ConfirmDialog';
import { formatRelative, formatDate } from '@/lib/format';

export const ROLES = {
    owner: { label: 'Propriétaire', description: 'Tous les droits, y compris supprimer le projet', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
    admin: { label: 'Administrateur', description: 'Modifie tout et gère les membres', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
    editor: { label: 'Éditeur', description: 'Crée et modifie tâches, budget, calendrier…', className: 'bg-sky-50 text-sky-700 ring-sky-200' },
    viewer: { label: 'Lecteur', description: 'Consulte et commente, sans modifier', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

const ASSIGNABLE = ['admin', 'editor', 'viewer'];

export default function ProjectShow({ project, invitations = [] }) {
    const me = usePage().props.auth.user;
    const [inviting, setInviting] = useState(false);
    const inputRef = useRef(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ email: '', role: 'editor' });
    const members = project.members ?? [];
    const canManage = project.can_manage;
    const isOwner = project.is_owner;

    // Ouverture directe du formulaire depuis la palette / le dashboard (?invite=1).
    useEffect(() => {
        if (canManage && new URLSearchParams(window.location.search).get('invite')) {
            setInviting(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => { if (inviting) inputRef.current?.focus(); }, [inviting]);

    const invite = (e) => {
        e.preventDefault();
        post(route('projects.members.add', project.id), {
            preserveScroll: true,
            onSuccess: () => { reset('email'); inputRef.current?.focus(); },
        });
    };

    const roleOf = (m) => (m.id === project.owner_id ? 'owner' : m.pivot?.role === 'member' ? 'editor' : m.pivot?.role ?? 'editor');
    const canEditRole = (m) => canManage && roleOf(m) !== 'owner' && m.id !== me.id && (isOwner || roleOf(m) !== 'admin');

    const changeRole = (m, role) => router.patch(route('projects.members.role', { project: project.id, user: m.id }), { role }, { preserveScroll: true });

    const remove = async (m) => {
        const self = m.id === me.id;
        const ok = await confirmDialog({
            title: self ? `Quitter « ${project.name} » ?` : `Retirer ${m.name} du projet ?`,
            message: self
                ? "Vous n'aurez plus accès à ce projet, sauf si on vous invite à nouveau."
                : "Cette personne n'aura plus accès aux tâches, au budget ni aux fichiers du projet.",
            confirmLabel: self ? 'Quitter le projet' : 'Retirer',
            danger: true,
        });
        if (ok) router.delete(route('projects.members.remove', { project: project.id, user: m.id }), { preserveScroll: true });
    };

    const resend = (inv) => router.post(route('projects.invitations.resend', { project: project.id, invitation: inv.id }), {}, { preserveScroll: true });
    const cancel = async (inv) => {
        if (await confirmDialog({ title: `Annuler l'invitation de ${inv.email} ?`, message: 'Le lien envoyé ne fonctionnera plus.', confirmLabel: "Annuler l'invitation", cancelLabel: 'Garder', danger: true })) {
            router.delete(route('projects.invitations.cancel', { project: project.id, invitation: inv.id }), { preserveScroll: true });
        }
    };

    return (
        <AppLayout header="Membres">
            <Head title={`Membres — ${project.name}`} />

            <PageHeader
                title="Membres du projet"
                description={project.description || project.name}
                actions={
                    <>
                        <Button variant="secondary" href={route('projects.dashboard', project.id)} iconRight={ArrowRightIcon}>Dashboard</Button>
                        {canManage && !inviting && <Button icon={UserPlusIcon} onClick={() => setInviting(true)}>Inviter</Button>}
                    </>
                }
            />

            <div className="max-w-3xl space-y-5">
                {inviting && canManage && (
                    <Card className="border-indigo-200 bg-indigo-50/40">
                        <form onSubmit={invite}>
                            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-gray-700">Inviter par e-mail</label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative flex-1">
                                    <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        ref={inputRef}
                                        id="invite-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Escape') { setInviting(false); clearErrors(); } }}
                                        placeholder="prenom.nom@exemple.com"
                                        error={errors.email}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                                <Select value={data.role} onChange={(e) => setData('role', e.target.value)} aria-label="Rôle" className="sm:w-40">
                                    {ASSIGNABLE.filter((r) => isOwner || r !== 'admin').map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                                </Select>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => { setInviting(false); reset(); clearErrors(); }} className="flex-1 sm:flex-none">Fermer</Button>
                                    <Button type="submit" loading={processing} className="flex-1 sm:flex-none">Inviter</Button>
                                </div>
                            </div>
                            <FieldError>{errors.email}</FieldError>
                            <p className="mt-2 text-xs text-gray-500">
                                {ROLES[data.role].label} : {ROLES[data.role].description.toLowerCase()}. Sans compte WorkSpace, la personne reçoit un e-mail pour en créer un.
                            </p>
                        </form>
                    </Card>
                )}

                <Card>
                    <CardHeader title={`${members.length} membre${members.length > 1 ? 's' : ''}`} />
                    <ul className="-mx-2 divide-y divide-gray-100">
                        {members.map((m) => {
                            const role = roleOf(m);
                            return (
                                <li key={m.id} className="group flex flex-wrap items-center gap-3 px-2 py-3 sm:flex-nowrap">
                                    <Avatar name={m.name} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">{m.name}{m.id === me.id && <span className="font-normal text-gray-400"> (vous)</span>}</p>
                                        <p className="truncate text-xs text-gray-500">{m.email}</p>
                                    </div>
                                    {canEditRole(m) ? (
                                        <Select value={role} onChange={(e) => changeRole(m, e.target.value)} aria-label={`Rôle de ${m.name}`} className="!w-auto !py-1.5 text-xs" title={ROLES[role].description}>
                                            {ASSIGNABLE.filter((r) => isOwner || r !== 'admin').map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
                                        </Select>
                                    ) : (
                                        <Badge className={ROLES[role].className} title={ROLES[role].description}>{ROLES[role].label}</Badge>
                                    )}
                                    {role !== 'owner' && (canEditRole(m) || m.id === me.id) && (
                                        <button
                                            type="button"
                                            onClick={() => remove(m)}
                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            title={m.id === me.id ? 'Quitter le projet' : 'Retirer du projet'}
                                            aria-label={m.id === me.id ? 'Quitter le projet' : `Retirer ${m.name}`}
                                        >
                                            {m.id === me.id ? <ArrowLeftOnRectangleIcon className="h-4 w-4" /> : <XMarkIcon className="h-4 w-4" />}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </Card>

                {canManage && invitations.length > 0 && (
                    <Card>
                        <CardHeader title="Invitations en attente" icon={ClockIcon} description="Les personnes rejoignent le projet en cliquant sur le lien reçu par e-mail." />
                        <ul className="-mx-2 divide-y divide-gray-100">
                            {invitations.map((inv) => {
                                const expired = new Date(inv.expires_at) < new Date();
                                return (
                                    <li key={inv.id} className="flex flex-wrap items-center gap-3 px-2 py-3 sm:flex-nowrap">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400">
                                            <EnvelopeIcon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{inv.email}</p>
                                            <p className="truncate text-xs text-gray-500">
                                                {expired ? <span className="text-rose-600">Expirée le {formatDate(inv.expires_at)}</span> : <>Envoyée {formatRelative(inv.created_at)}{inv.inviter && ` par ${inv.inviter.name}`}</>}
                                            </p>
                                        </div>
                                        <Badge className={ROLES[inv.role]?.className}>{ROLES[inv.role]?.label}</Badge>
                                        <Button variant="ghost" size="sm" icon={ArrowPathIcon} onClick={() => resend(inv)}>Renvoyer</Button>
                                        <button type="button" onClick={() => cancel(inv)} className="rounded-md p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600" title="Annuler l'invitation" aria-label={`Annuler l'invitation de ${inv.email}`}>
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                )}

                <Card className="bg-gray-50/60">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Qui peut faire quoi ?</h2>
                    <dl className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(ROLES).map(([key, r]) => (
                            <div key={key} className="flex items-start gap-2">
                                <Badge className={r.className}>{r.label}</Badge>
                                <dd className="text-xs text-gray-600">{r.description}</dd>
                            </div>
                        ))}
                    </dl>
                </Card>
            </div>
        </AppLayout>
    );
}
