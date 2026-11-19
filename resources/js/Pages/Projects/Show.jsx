import { useEffect, useRef, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { UserPlusIcon, XMarkIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import { Input, FieldError } from '@/Components/ui/Field';
import Avatar from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { confirmDialog } from '@/Components/ui/ConfirmDialog';

export default function ProjectShow({ project }) {
    const [inviting, setInviting] = useState(false);
    const inputRef = useRef(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ email: '' });
    const members = project.members ?? [];

    // Ouverture directe du formulaire depuis la palette / le dashboard (?invite=1).
    useEffect(() => {
        if (project.is_owner && new URLSearchParams(window.location.search).get('invite')) {
            setInviting(true);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => { if (inviting) inputRef.current?.focus(); }, [inviting]);

    const addMember = (e) => {
        e.preventDefault();
        post(route('projects.members.add', project.id), {
            preserveScroll: true,
            onSuccess: () => { reset(); inputRef.current?.focus(); },
        });
    };

    const removeMember = async (member) => {
        const ok = await confirmDialog({
            title: `Retirer ${member.name} du projet ?`,
            message: "Cette personne n'aura plus accès aux tâches, au budget ni aux fichiers du projet.",
            confirmLabel: 'Retirer',
            danger: true,
        });
        if (ok) router.delete(route('projects.members.remove', { project: project.id, user: member.id }), { preserveScroll: true });
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
                        {project.is_owner && !inviting && (
                            <Button icon={UserPlusIcon} onClick={() => setInviting(true)}>Inviter</Button>
                        )}
                    </>
                }
            />

            <div className="max-w-3xl space-y-5">
                {inviting && project.is_owner && (
                    <Card className="border-indigo-200 bg-indigo-50/40">
                        <form onSubmit={addMember}>
                            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Adresse e-mail de la personne à inviter
                            </label>
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
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => { setInviting(false); reset(); clearErrors(); }} className="flex-1 sm:flex-none">Annuler</Button>
                                    <Button type="submit" loading={processing} className="flex-1 sm:flex-none">Ajouter</Button>
                                </div>
                            </div>
                            <FieldError>{errors.email}</FieldError>
                            <p className="mt-2 text-xs text-gray-500">La personne doit déjà avoir un compte WorkSpace.</p>
                        </form>
                    </Card>
                )}

                <Card>
                    <CardHeader title={`${members.length} membre${members.length > 1 ? 's' : ''}`} />
                    <ul className="-mx-2 divide-y divide-gray-100">
                        {members.map((member) => {
                            const isOwner = member.id === project.owner_id || member.pivot?.role === 'owner';
                            return (
                                <li key={member.id} className="group flex items-center gap-3 px-2 py-3">
                                    <Avatar name={member.name} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                                        <p className="truncate text-xs text-gray-500">{member.email}</p>
                                    </div>
                                    {isOwner
                                        ? <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200">Propriétaire</Badge>
                                        : <Badge>Membre</Badge>}
                                    {project.is_owner && !isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => removeMember(member)}
                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            title="Retirer du projet"
                                            aria-label={`Retirer ${member.name}`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            </div>
        </AppLayout>
    );
}
