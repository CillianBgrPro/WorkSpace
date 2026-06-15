import { useForm, router } from '@inertiajs/react';

export default function TaskComments({ task }) {
    const comments = task.comments ?? [];

    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('tasks.comments.store', task.id), {
            onSuccess: () => reset('body'),
        });
    };

    const removeComment = (commentId) => {
        if (confirm('Supprimer ce commentaire ?')) {
            router.delete(route('comments.destroy', commentId));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <h3 className="font-semibold dark:text-white">
                Commentaires ({comments.length})
            </h3>

            {/* Formulaire */}
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">
                        Ajouter un commentaire
                    </label>
                    <textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                    {errors.body && (
                        <p className="text-red-500 text-sm mt-1">{errors.body}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing || !data.body}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {processing ? 'Publication...' : 'Publier'}
                </button>
            </form>

            {/* Liste des commentaires */}
            {comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-semibold dark:text-white">
                                    {comment.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {comment.created_at}
                                </p>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {comment.body}
                            </p>

                            {comment.can_delete && (
                                <button
                                    type="button"
                                    onClick={() => removeComment(comment.id)}
                                    className="mt-2 text-xs text-red-600 hover:text-red-700"
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun commentaire pour le moment.
                </p>
            )}
        </div>
    );
}