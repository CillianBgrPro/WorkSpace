import { useForm, router, usePage } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '@/Components/ui/Card';
import Avatar from '@/Components/ui/Avatar';
import Button from '@/Components/ui/Button';
import { Textarea, FieldError } from '@/Components/ui/Field';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { modKey } from '@/Components/ui/Kbd';
import { formatDateTime, formatRelative } from '@/lib/format';

export default function TaskComments({ task }) {
    const comments = task.comments ?? [];
    const user = usePage().props.auth?.user;
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });

    const submit = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;
        post(route('tasks.comments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    const removeComment = async (commentId) => {
        if (await confirmDelete('ce commentaire')) {
            router.delete(route('comments.destroy', commentId), { preserveScroll: true });
        }
    };

    return (
        <Card>
            <CardHeader title={`Commentaires${comments.length ? ` · ${comments.length}` : ''}`} icon={ChatBubbleLeftRightIcon} />

            {comments.length > 0 && (
                <ul className="mb-5 space-y-4">
                    {comments.map((comment) => (
                        <li key={comment.id} className="group flex gap-3">
                            <Avatar name={comment.user?.name ?? '?'} size="md" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-sm font-semibold text-gray-900">{comment.user?.name}</p>
                                    <time className="text-xs text-gray-400" title={formatDateTime(comment.created_at)}>{formatRelative(comment.created_at)}</time>
                                    {comment.can_delete && (
                                        <button
                                            type="button"
                                            onClick={() => removeComment(comment.id)}
                                            className="ml-auto rounded p-1 text-gray-300 opacity-100 transition hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            aria-label="Supprimer le commentaire"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">{comment.body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={submit} className="flex gap-3">
                <Avatar name={user?.name ?? ''} size="md" className="hidden sm:inline-flex" />
                <div className="min-w-0 flex-1">
                    <Textarea
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={2}
                        placeholder={comments.length ? 'Répondre…' : 'Écrire le premier commentaire…'}
                        aria-label="Nouveau commentaire"
                        error={errors.body}
                    />
                    <FieldError>{errors.body}</FieldError>
                    <div className="mt-2 flex items-center justify-end gap-3">
                        <span className="hidden text-xs text-gray-400 sm:inline">{modKey} + Entrée pour envoyer</span>
                        <Button type="submit" size="sm" loading={processing} disabled={!data.body.trim()}>Commenter</Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
