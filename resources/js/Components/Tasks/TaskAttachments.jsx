import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { PaperClipIcon, ArrowUpTrayIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '@/Components/ui/Card';
import { Spinner } from '@/Components/ui/Button';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { toast } from '@/Components/ui/Toaster';
import FilePreview from '@/Components/Files/FilePreview';

const MAX = 10 * 1024 * 1024;
const ACCEPT = 'image/*,application/pdf,.pdf';

export default function TaskAttachments({ task, canEdit = true }) {
    const attachments = task.attachments ?? [];
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(null);
    // Même visionneuse que la page Fichiers.
    const previewFiles = attachments.map((a) => ({ ...a, name: a.original_name }));
    const inputRef = useRef(null);

    // Envoi immédiat dès qu'un fichier est choisi ou déposé : pas de bouton « Uploader » à chercher.
    const upload = (file) => {
        if (!file) return;
        if (file.size > MAX) { toast.error('Fichier trop lourd : 10 Mo maximum.'); return; }
        if (!/^image\/|application\/pdf/.test(file.type)) { toast.error('Formats acceptés : images et PDF.'); return; }
        setUploading(true);
        router.post(route('tasks.attachments.store', task.id), { file }, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => toast.error(errors.file ?? "L'envoi a échoué."),
            onFinish: () => { setUploading(false); if (inputRef.current) inputRef.current.value = ''; },
        });
    };

    const remove = async (attachment) => {
        if (await confirmDelete(`« ${attachment.original_name} »`)) {
            router.delete(route('attachments.destroy', attachment.id), { preserveScroll: true });
        }
    };

    return (
        <Card>
            <CardHeader title={`Pièces jointes${attachments.length ? ` · ${attachments.length}` : ''}`} icon={PaperClipIcon} />

            {attachments.length > 0 && (
                <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {attachments.map((a) => (
                        <li key={a.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
                            <button type="button" onClick={() => setPreviewIndex(attachments.indexOf(a))} className="block w-full text-left" title={`Aperçu de ${a.original_name}`}>
                                {a.is_image ? (
                                    <img src={a.url} alt={a.original_name} className="h-28 w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="flex h-28 w-full flex-col items-center justify-center gap-1 bg-gray-50 text-gray-400">
                                        <DocumentIcon className="h-8 w-8" />
                                        <span className="text-[11px] font-semibold uppercase text-rose-500">PDF</span>
                                    </div>
                                )}
                                <p className="truncate border-t border-gray-100 px-2 py-1.5 text-xs text-gray-600" title={a.original_name}>{a.original_name}</p>
                            </button>
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() => remove(a)}
                                    className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1 text-gray-500 shadow-sm transition hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                    aria-label={`Supprimer ${a.original_name}`}
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {canEdit && (
                <label
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files?.[0]); }}
                    className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-5 text-sm transition ${
                        dragOver ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {uploading ? <Spinner className="h-5 w-5 text-indigo-500" /> : <ArrowUpTrayIcon className="h-5 w-5 text-gray-400" />}
                    <span>
                        {uploading ? 'Envoi en cours…' : <><span className="font-medium text-indigo-600">Choisir un fichier</span> ou glissez-le ici</>}
                        <span className="block text-xs text-gray-400">Images ou PDF · 10 Mo max.</span>
                    </span>
                    <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
                </label>
            )}
            {!canEdit && attachments.length === 0 && <p className="text-sm text-gray-400">Aucune pièce jointe.</p>}
            <FilePreview
                files={previewFiles}
                index={previewIndex}
                onIndexChange={setPreviewIndex}
                onClose={() => setPreviewIndex(null)}
                urls={(f) => ({ preview: f.url, download: `${f.url}?download=1` })}
            />
        </Card>
    );
}
