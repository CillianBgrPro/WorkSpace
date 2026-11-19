import { Head, router, useForm } from '@inertiajs/react';
import { TrashIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card, CardHeader } from '@/Components/ui/Card';
import Field, { Input, Textarea, Select } from '@/Components/ui/Field';
import Avatar from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { confirmDialog, confirmDelete } from '@/Components/ui/ConfirmDialog';

const ROLES = {
    admin: { label: 'Administrateur', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
    chef_projet: { label: 'Chef de projet', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
    collaborateur: { label: 'Collaborateur', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
};

export default function TeamEdit({ team, users }) {
    const details = useForm({ name: team.name, description: team.description || '' });
    const member = useForm({ member_id: '', role: 'collaborateur' });

    const memberIds = team.members.map((m) => m.id);
    const available = users.filter((u) => !memberIds.includes(u.id));

    const updateTeam = (e) => {
        e.preventDefault();
        details.put(`/teams/${team.id}`, { preserveScroll: true });
    };

    const addMember = (e) => {
        e.preventDefault();
        member.post(`/teams/${team.id}/members`, {
            preserveScroll: true,
            onSuccess: () => member.reset('member_id'),
        });
    };

    const removeMember = async (m) => {
        const ok = await confirmDialog({
            title: `Retirer ${m.name} de l'équipe ?`,
            message: 'Cette personne reste membre du projet.',
            confirmLabel: 'Retirer',
            danger: true,
        });
        if (ok) router.delete(route('teams.members.remove', { team: team.id, user: m.id }), { preserveScroll: true });
    };

    const deleteTeam = async () => {
        if (await confirmDelete(`l'équipe « ${team.name} »`, 'Les membres restent dans le projet. Cette action est définitive.')) {
            router.delete(`/teams/${team.id}`);
        }
    };

    return (
        <AppLayout header={team.name}>
            <Head title={team.name} />
            <PageHeader
                title={team.name}
                description={`${team.members.length} membre${team.members.length > 1 ? 's' : ''}`}
                back={{ href: '/teams', label: 'Équipes' }}
            />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <Card>
                    <CardHeader title="Membres" />

                    {team.members.length > 0 ? (
                        <ul className="-mx-2 mb-5 divide-y divide-gray-100">
                            {team.members.map((m) => {
                                const role = ROLES[m.pivot?.role] ?? { label: m.pivot?.role, className: 'bg-gray-50 text-gray-600 ring-gray-200' };
                                return (
                                    <li key={m.id} className="group flex items-center gap-3 px-2 py-2.5">
                                        <Avatar name={m.name} />
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{m.name}</span>
                                        <Badge className={role.className}>{role.label}</Badge>
                                        <button
                                            type="button"
                                            onClick={() => removeMember(m)}
                                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            aria-label={`Retirer ${m.name}`}
                                            title="Retirer de l'équipe"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="mb-5 text-sm text-gray-400">Aucun membre pour l'instant.</p>
                    )}

                    {available.length > 0 ? (
                        <form onSubmit={addMember} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 sm:flex-row">
                            <Select value={member.data.member_id} onChange={(e) => member.setData('member_id', e.target.value)} aria-label="Membre à ajouter" className="sm:flex-1" error={member.errors.member_id}>
                                <option value="">Ajouter un membre du projet…</option>
                                {available.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </Select>
                            <Select value={member.data.role} onChange={(e) => member.setData('role', e.target.value)} aria-label="Rôle" className="sm:w-44">
                                {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                            </Select>
                            <Button type="submit" icon={UserPlusIcon} loading={member.processing} disabled={!member.data.member_id}>Ajouter</Button>
                        </form>
                    ) : (
                        <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                            Tous les membres du projet font déjà partie de l'équipe.
                        </p>
                    )}
                </Card>

                <div className="space-y-5">
                    <Card as="form" onSubmit={updateTeam} className="space-y-4">
                        <CardHeader title="Informations" className="!mb-0" />
                        <Field label="Nom" required error={details.errors.name}>
                            {(p) => <Input {...p} value={details.data.name} onChange={(e) => details.setData('name', e.target.value)} />}
                        </Field>
                        <Field label="Description" optional error={details.errors.description}>
                            {(p) => <Textarea {...p} rows={3} value={details.data.description} onChange={(e) => details.setData('description', e.target.value)} />}
                        </Field>
                        <Button type="submit" loading={details.processing} disabled={!details.isDirty} className="w-full">Enregistrer</Button>
                    </Card>

                    <Card className="border-rose-200">
                        <h2 className="text-sm font-semibold text-gray-900">Supprimer l'équipe</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Les membres restent dans le projet.</p>
                        <Button variant="danger-ghost" size="sm" icon={TrashIcon} onClick={deleteTeam} className="mt-3 -ml-2">Supprimer l'équipe</Button>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
