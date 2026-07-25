import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    DocumentIcon, ArrowUpTrayIcon, ArrowDownTrayIcon,
    TrashIcon, DocumentTextIcon, PhotoIcon, TableCellsIcon,
    ArchiveBoxIcon, CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function ProjectFiles({ files = [], canEdit = false }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!data.file) return;

        post(route('projects.files.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleDelete = (file) => {
        if (!confirm(`Supprimer le fichier "${file.name}" ?`)) return;
        router.delete(route('projects.files.destroy', file.id));
    };

    const getFileIcon = (mimeType, fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) {
            return <PhotoIcon className="w-6 h-6 text-purple-500" />;
        }
        if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
            return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return <TableCellsIcon className="w-6 h-6 text-emerald-500" />;
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return <ArchiveBoxIcon className="w-6 h-6 text-amber-500" />;
        }
        if (['js', 'ts', 'jsx', 'json', 'php', 'html', 'css'].includes(ext)) {
            return <CodeBracketIcon className="w-6 h-6 text-pink-500" />;
        }
        return <DocumentIcon className="w-6 h-6 text-gray-400" />;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AppLayout header="Fichiers du Projet">
            <Head title="Fichiers" />

            <div className="max-w-6xl mx-auto space-y-6">

                {/* Zone de téléversement */}
                {canEdit && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Ajouter un document ou fichier
                        </h2>

                        <form onSubmit={submit} className="space-y-4">
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                        setData('file', e.dataTransfer.files[0]);
                                    }
                                }}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                                    isDragging
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                                }`}
                                onClick={() => document.getElementById('file-upload-input').click()}
                            >
                                <ArrowUpTrayIcon className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {data.file ? (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                            Fichier sélectionné : {data.file.name} ({formatFileSize(data.file.size)})
                                        </span>
                                    ) : (
                                        'Glissez-déposez votre fichier ici, ou cliquez pour parcourir'
                                    )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Taille maximale : 10 Mo</p>

                                <input
                                    id="file-upload-input"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>

                            {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                            )}

                            {data.file && (
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => reset()}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition shadow"
                                    >
                                        {processing ? 'Téléversement...' : 'Téléverser'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Liste des fichiers */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Documents du projet ({files.length})
                        </h3>
                    </div>

                    {files.length === 0 ? (
                        <div className="text-center py-12">
                            <DocumentIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Aucun fichier n'a été téléversé dans ce projet pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            {getFileIcon(file.mime_type, file.name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm text-gray-800 dark:text-white truncate" title={file.name}>
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                <span>{formatFileSize(file.size)}</span>
                                                <span>•</span>
                                                <span>{file.user ? file.user.name : 'Inconnu'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2">
                                        <a
                                            href={route('projects.files.download', file.id)}
                                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                            title="Télécharger"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                        </a>

                                        {canEdit && (
                                            <button
                                                onClick={() => handleDelete(file)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
