import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    UserPlusIcon, TrashIcon, ArrowLeftIcon, ChevronRightIcon,
    ShieldCheckIcon, UserIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function ProjectShow({ project }) {
    const [showAddForm, setShowAddForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const addMember = (e) => {
        e.preventDefault();
        post(route('projects.members.add', project.id), {
            onSuccess: () => {
                reset();
                setShowAddForm(false);
            },
        });
    };

    const removeMember = (userId, userName) => {
        if (!confirm(`Retirer ${userName} du projet ?`)) return;
        router.delete(route('projects.members.remove', { project: project.id, user: userId }));
    };

    return (
        <AppLayout header={`Projet : ${project.name}`}>
            <Head title={`Gérer — ${project.name}`} />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* Retour */}
                <Link
                    href={route('projects.index')}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Retour aux projets
                </Link>

                {/* Infos projet */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6 border-l-4" style={{ borderColor: project.color }}>
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: project.color }}
                        >
                            {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
                            {project.description && (
                                <p className="text-gray-500 text-sm">{project.description}</p>
                            )}
                        </div>
                    </div>

                    <Link
                            href={route('projects.dashboard', project.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition"
                            style={{ backgroundColor: project.color }}
                        >
                            Ouvrir le dashboard
                            <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                </div>

                {/* Membres */}
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Membres ({project.members?.length ?? 0})
                        </h3>
                        {project.is_owner && (
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                            >
                                <UserPlusIcon className="w-4 h-4" />
                                Ajouter un membre
                            </button>
                        )}
                    </div>

                    {/* Formulaire ajout membre */}
                    {showAddForm && project.is_owner && (
                        <form onSubmit={addMember} className="flex gap-2 mb-5 p-4 bg-indigo-50 rounded-lg">
                            <div className="flex-1">
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="email@exemple.com"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
                            >
                                {processing ? '...' : 'Inviter'}
                            </button>
                        </form>
                    )}

                    {/* Liste membres */}
                    <ul className="divide-y divide-gray-100">
                        {(project.members ?? []).map(member => {
                            const isOwnerMember = member.id === project.owner_id;
                            const pivotRole = member.pivot?.role;
                            return (
                                <li key={member.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                                            <p className="text-gray-400 text-xs">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOwnerMember || pivotRole === 'owner' ? (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                                                <ShieldCheckIcon className="w-3 h-3" />
                                                Propriétaire
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                <UserIcon className="w-3 h-3" />
                                                Membre
                                            </span>
                                        )}

                                        {project.is_owner && !isOwnerMember && (
                                            <button
                                                onClick={() => removeMember(member.id, member.name)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Retirer du projet"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
