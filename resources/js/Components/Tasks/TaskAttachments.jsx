import { useForm, router } from '@inertiajs/react';

export default function TaskAttachments({ task }) {
    const attachments = task.attachments ?? [];

    const { data, setData, post, processing, errors, reset } = useForm({
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (!data.file) {
            return;
        }

        post(route('tasks.attachments.store', task.id), {
            forceFormData: true,
            onSuccess: () => reset('file'),
        });
    };

    const removeAttachment = (attachmentId) => {
        if (confirm('Supprimer ce fichier ?')) {
            router.delete(route('attachments.destroy', attachmentId));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <h3 className="font-semibold dark:text-white">
                Pieces jointes ({attachments.length})
            </h3>

            <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1 dark:text-white">
                        Ajouter une image ou un PDF
                    </label>
                    <input
                        type="file"
                        accept="image/*,application/pdf,.pdf"
                        onChange={(e) => setData('file', e.target.files[0])}
                        className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG, WebP, GIF ou PDF — max. 10 Mo
                    </p>
                    {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing || !data.file}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? 'Envoi...' : 'Uploader'}
                </button>
            </form>

            {attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                {attachment.is_image ? (
                                    <img
                                        src={attachment.url}
                                        alt={attachment.original_name}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300">
                                        <span className="text-3xl font-bold text-red-600">PDF</span>
                                        <span className="text-xs mt-1 px-2 text-center">Ouvrir le document</span>
                                    </div>
                                )}
                            </a>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900">
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={attachment.original_name}>
                                    {attachment.original_name}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.id)}
                                    className="mt-1 text-xs text-red-600 hover:text-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucun fichier pour le moment.</p>
            )}
        </div>
    );
}
