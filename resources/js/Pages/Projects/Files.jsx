import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    DocumentIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, TrashIcon, DocumentTextIcon,
    PhotoIcon, TableCellsIcon, ArchiveBoxIcon, CodeBracketIcon, MagnifyingGlassIcon, EyeIcon,
    FilmIcon, MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import FilePreview from '@/Components/Files/FilePreview';
import { previewKind } from '@/lib/filePreview';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import EmptyState from '@/Components/ui/EmptyState';
import { Spinner } from '@/Components/ui/Button';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { toast } from '@/Components/ui/Toaster';
import { formatRelative, formatDateTime } from '@/lib/format';

const MAX = 10 * 1024 * 1024;

function fileIcon(mimeType, fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) return [PhotoIcon, 'bg-violet-50 text-violet-500'];
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return [DocumentTextIcon, 'bg-blue-50 text-blue-500'];
    if (['xls', 'xlsx', 'csv'].includes(ext)) return [TableCellsIcon, 'bg-emerald-50 text-emerald-500'];
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return [ArchiveBoxIcon, 'bg-amber-50 text-amber-500'];
    if (['js', 'ts', 'jsx', 'json', 'php', 'html', 'css'].includes(ext)) return [CodeBracketIcon, 'bg-pink-50 text-pink-500'];
    if (['mp4', 'webm', 'mov', 'ogv'].includes(ext)) return [FilmIcon, 'bg-sky-50 text-sky-500'];
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return [MusicalNoteIcon, 'bg-orange-50 text-orange-500'];
    return [DocumentIcon, 'bg-gray-100 text-gray-400'];
}

function formatSize(bytes) {
    if (!bytes) return '0 o';
    const units = ['o', 'Ko', 'Mo', 'Go'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${parseFloat((bytes / 1024 ** i).toFixed(1)).toLocaleString('fr-FR')} ${units[i]}`;
}

export default function ProjectFiles({ files = [], canEdit = false }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [query, setQuery] = useState('');
    const [previewId, setPreviewId] = useState(null);
    const inputRef = useRef(null);

    // Lien direct vers un aperçu : /project-files?apercu=12
    useEffect(() => {
        const id = Number(new URLSearchParams(window.location.search).get('apercu'));
        if (id && files.some((f) => f.id === id)) setPreviewId(id);
    }, []);

    const openPreview = (id) => {
        setPreviewId(id);
        const url = new URL(window.location.href);
        if (id) url.searchParams.set('apercu', id); else url.searchParams.delete('apercu');
        window.history.replaceState(window.history.state, '', url);
    };

    // Envoi dès la sélection : un geste au lieu de deux.
    const upload = (file) => {
        if (!file) return;
        if (file.size > MAX) { toast.error(`« ${file.name} » dépasse 10 Mo.`); return; }
        setUploading(file.name);
        router.post(route('projects.files.store'), { file }, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => toast.error(errors.file ?? "L'envoi a échoué."),
            onFinish: () => { setUploading(null); if (inputRef.current) inputRef.current.value = ''; },
        });
    };

    const remove = async (file) => {
        if (await confirmDelete(`« ${file.name} »`)) {
            router.delete(route('projects.files.destroy', file.id), { preserveScroll: true });
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files;
    }, [files, query]);

    return (
        <AppLayout header="Fichiers">
            <Head title="Fichiers" />

            <PageHeader
                title="Fichiers"
                description={files.length ? `${files.length} document${files.length > 1 ? 's' : ''} partagé${files.length > 1 ? 's' : ''} avec l'équipe · cliquez sur un fichier pour l'aperçu` : 'Centralisez les documents du projet.'}
            />

            <div className="space-y-5">
                {canEdit && (
                    <label
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                        }`}
                    >
                        {uploading ? <Spinner className="h-7 w-7 text-indigo-500" /> : <ArrowUpTrayIcon className="h-7 w-7 text-indigo-500" />}
                        <p className="text-sm text-gray-700">
                            {uploading
                                ? <>Envoi de <span className="font-medium">{uploading}</span>…</>
                                : <><span className="font-semibold text-indigo-600">Choisissez un fichier</span> ou glissez-le ici</>}
                        </p>
                        <p className="text-xs text-gray-400">Tous formats · 10 Mo maximum</p>
                        <input ref={inputRef} type="file" className="sr-only" disabled={!!uploading} onChange={(e) => upload(e.target.files?.[0])} />
                    </label>
                )}

                {files.length === 0 ? (
                    !canEdit && <EmptyState icon={DocumentIcon} title="Aucun fichier" description="Les documents partagés par l'équipe apparaîtront ici." />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
                        {files.length > 5 && (
                            <div className="relative border-b border-gray-100">
                                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="search"
                                    data-page-search
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Filtrer les fichiers…"
                                    aria-label="Filtrer les fichiers"
                                    className="w-full border-0 py-3 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:ring-0"
                                />
                            </div>
                        )}
                        <ul className="divide-y divide-gray-100">
                            {filtered.map((file) => {
                                const [Icon, tone] = fileIcon(file.mime_type, file.name);
                                return (
                                    <li key={file.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => openPreview(file.id)}
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${tone}`}
                                            tabIndex={-1}
                                            aria-hidden="true"
                                        >
                                            {previewKind(file.name) === 'image'
                                                ? <img src={route('projects.files.preview', file.id)} alt="" loading="lazy" className="h-full w-full object-cover" />
                                                : <Icon className="h-5 w-5" />}
                                        </button>
                                        <div className="min-w-0 flex-1">
                                            <button
                                                type="button"
                                                onClick={() => openPreview(file.id)}
                                                className="block max-w-full truncate text-left text-sm font-medium text-gray-900 hover:text-indigo-600"
                                                title={`Aperçu de ${file.name}`}
                                            >
                                                {file.name}
                                            </button>
                                            <p className="truncate text-xs text-gray-500">
                                                {formatSize(file.size)} · {file.user?.name ?? 'Inconnu'}
                                                {file.created_at && <> · <span title={formatDateTime(file.created_at)}>{formatRelative(file.created_at)}</span></>}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openPreview(file.id)}
                                            className="hidden rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600 sm:inline-flex"
                                            title="Aperçu"
                                            aria-label={`Aperçu de ${file.name}`}
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <a
                                            href={route('projects.files.download', file.id)}
                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-indigo-600"
                                            title="Télécharger"
                                            aria-label={`Télécharger ${file.name}`}
                                        >
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                        </a>
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => remove(file)}
                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                                title="Supprimer"
                                                aria-label={`Supprimer ${file.name}`}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                            {filtered.length === 0 && <li className="px-4 py-8 text-center text-sm text-gray-500">Aucun fichier ne correspond à « {query} ».</li>}
                        </ul>
                    </div>
                )}
            </div>

            <FilePreview
                files={filtered}
                index={previewId ? (filtered.findIndex((f) => f.id === previewId) === -1 ? null : filtered.findIndex((f) => f.id === previewId)) : null}
                onIndexChange={(i) => openPreview(filtered[i].id)}
                onClose={() => openPreview(null)}
                formatSize={formatSize}
            />
        </AppLayout>
    );
}
