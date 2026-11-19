import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CreateProjectModal from '@/Components/Projects/CreateProjectModal';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import {
    PlusIcon, FolderIcon, UsersIcon, ChevronRightIcon,
    TrashIcon, ArrowRightOnRectangleIcon, SparklesIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function ProjectsIndex({ projects, auth }) {
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (project) => {
        if (await confirmDelete(`le projet « ${project.name} »`, 'Toutes ses tâches, budgets, événements et fichiers seront supprimés pour tous les membres. Cette action est définitive.')) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    const activeProjects = projects.filter(p => p.status === 'active');
    const archivedProjects = projects.filter(p => p.status !== 'active');

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#080520]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Head title="Mes Projets" />

            {/* Fond animé */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 -left-20 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">

                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes Projets</h1>
                        </div>
                        <p className="text-gray-400 text-sm sm:text-base sm:ml-13">
                            Bonjour <span className="text-indigo-400 font-medium">{auth?.user?.name}</span> — Choisissez un projet pour commencer.
                        </p>
                    </div>

                    <div className="flex flex-row-reverse sm:flex-row items-center gap-3 sm:shrink-0">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition text-sm"
                            aria-label="Déconnexion"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </Link>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/30"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Nouveau projet
                        </button>
                    </div>
                </div>

                {/* Projets actifs */}
                {activeProjects.length === 0 && archivedProjects.length === 0 ? (
                    <EmptyState onNew={() => setShowModal(true)} />
                ) : (
                    <>
                        {activeProjects.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    Projets actifs — {activeProjects.length}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {activeProjects.map(project => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            currentUserId={auth?.user?.id}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {archivedProjects.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ArchiveBoxIcon className="w-4 h-4" />
                                    Archivés — {archivedProjects.length}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-60">
                                    {archivedProjects.map(project => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            currentUserId={auth?.user?.id}
                                            onDelete={handleDelete}
                                            archived
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal création */}
            {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
        </div>
    );
}

function ProjectCard({ project, currentUserId, onDelete, archived = false }) {
    const isOwner = project.owner_id === currentUserId;
    const membersCount = project.members_count ?? 0;

    return (
        <div
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
            style={{ '--project-color': project.color }}
        >
            {/* Accent gradient en haut */}
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ backgroundColor: project.color }}
            />

            {/* Glow subtil */}
            <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: project.color }}
            />

            <div className="relative">
                {/* Icône + badges */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: project.color + '25', border: `1px solid ${project.color}40` }}
                    >
                        <FolderIcon className="w-6 h-6" style={{ color: project.color }} />
                    </div>

                    <div className="flex items-center gap-2">
                        {isOwner ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-gray-300">
                                Propriétaire
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/5 text-gray-400">
                                Membre
                            </span>
                        )}
                    </div>
                </div>

                {/* Nom & description */}
                <h3 className="text-white font-bold text-lg mb-1 truncate">{project.name}</h3>
                {project.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Membres */}
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
                    <UsersIcon className="w-4 h-4" />
                    <span>{membersCount} membre{membersCount > 1 ? 's' : ''}</span>
                    {project.owner && !isOwner && (
                        <span className="text-gray-500"> · {project.owner.name}</span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {!archived && (
                        <Link
                            href={route('projects.dashboard', project.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:shadow-lg"
                            style={{
                                backgroundColor: project.color,
                                boxShadow: `0 0 0 0 ${project.color}`,
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${project.color}50`}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            Ouvrir
                            <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                    )}

                    <Link
                        href={route('projects.show', project.id)}
                        className="px-3 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition text-sm"
                        title="Gérer les membres"
                    >
                        <UsersIcon className="w-4 h-4" />
                    </Link>

                    {isOwner && (
                        <button
                            onClick={() => onDelete(project)}
                            className="px-3 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm"
                            title="Supprimer"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ onNew }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
                <FolderIcon className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Aucun projet pour l'instant</h2>
            <p className="text-gray-400 mb-8 max-w-sm">
                Créez votre premier projet pour commencer à organiser vos tâches, budgets et événements.
            </p>
            <button
                onClick={onNew}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition shadow-lg shadow-indigo-600/30"
            >
                <PlusIcon className="w-5 h-5" />
                Créer mon premier projet
            </button>
        </div>
    );
}
