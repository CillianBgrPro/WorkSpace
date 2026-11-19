import { Fragment, useMemo, useRef, useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { ChatBubbleLeftRightIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '@/Components/ui/Card';
import Avatar from '@/Components/ui/Avatar';
import Button from '@/Components/ui/Button';
import { Textarea, FieldError } from '@/Components/ui/Field';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { modKey } from '@/Components/ui/Kbd';
import { formatDateTime, formatRelative } from '@/lib/format';

const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Met en évidence les @mentions de membres dans un commentaire. */
function CommentBody({ body, members }) {
    const parts = useMemo(() => {
        if (!members.length) return [body];
        const names = [...members].map((m) => m.name).sort((a, b) => b.length - a.length).map(escapeRe);
        const re = new RegExp(`(@(?:${names.join('|')}|[\\p{L}][\\p{L}-]*))`, 'giu');
        return body.split(re);
    }, [body, members]);

    return (
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-700">
            {parts.map((part, i) => {
                const isMention = part.startsWith('@') && members.some((m) => norm(part.slice(1)).startsWith(norm(m.name.split(' ')[0])));
                return isMention
                    ? <span key={i} className="rounded bg-indigo-50 px-1 font-medium text-indigo-700">{part}</span>
                    : <Fragment key={i}>{part}</Fragment>;
            })}
        </p>
    );
}

export default function TaskComments({ task, members = [] }) {
    const comments = task.comments ?? [];
    const user = usePage().props.auth?.user;
    const { data, setData, post, processing, errors, reset } = useForm({ body: '' });
    const textareaRef = useRef(null);
    const [mention, setMention] = useState(null); // { query, start, index }

    const others = members.filter((m) => m.id !== user?.id);
    const suggestions = mention
        ? others.filter((m) => norm(m.name).includes(norm(mention.query))).slice(0, 6)
        : [];

    const submit = (e) => {
        e?.preventDefault();
        if (!data.body.trim()) return;
        post(route('tasks.comments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => { reset('body'); setMention(null); },
        });
    };

    // Détecte « @mot » juste avant le curseur pour proposer les membres.
    const onChange = (e) => {
        const value = e.target.value;
        setData('body', value);
        const caret = e.target.selectionStart;
        const match = value.slice(0, caret).match(/(?:^|\s)@([\p{L}\p{N}-]{0,30})$/u);
        setMention(match && others.length ? { query: match[1], start: caret - match[1].length - 1, index: 0 } : null);
    };

    const pick = (member) => {
        const el = textareaRef.current;
        const caret = el.selectionStart;
        const before = data.body.slice(0, mention.start);
        const after = data.body.slice(caret);
        const inserted = `@${member.name} `;
        setData('body', before + inserted + after);
        setMention(null);
        requestAnimationFrame(() => {
            el.focus();
            const pos = before.length + inserted.length;
            el.setSelectionRange(pos, pos);
        });
    };

    const onKeyDown = (e) => {
        if (!mention || !suggestions.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setMention((m) => ({ ...m, index: (m.index + 1) % suggestions.length })); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setMention((m) => ({ ...m, index: (m.index - 1 + suggestions.length) % suggestions.length })); }
        else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); pick(suggestions[mention.index]); }
        else if (e.key === 'Escape') { e.stopPropagation(); setMention(null); }
    };

    const removeComment = async (commentId) => {
        if (await confirmDelete('ce commentaire')) {
            router.delete(route('comments.destroy', commentId), { preserveScroll: true });
        }
    };

    const allMembers = members.length ? members : [];

    return (
        <Card id="commentaires" className="scroll-mt-4">
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
                                            className="ml-auto rounded p-1 text-gray-300 transition hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                            aria-label="Supprimer le commentaire"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <CommentBody body={comment.body} members={allMembers} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={submit} className="flex gap-3">
                <Avatar name={user?.name ?? ''} size="md" className="hidden sm:inline-flex" />
                <div className="relative min-w-0 flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={data.body}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onBlur={() => setTimeout(() => setMention(null), 150)}
                        rows={2}
                        placeholder={others.length ? 'Écrire un commentaire… (@ pour mentionner)' : 'Écrire un commentaire…'}
                        aria-label="Nouveau commentaire"
                        error={errors.body}
                    />
                    {mention && suggestions.length > 0 && (
                        <ul className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5" role="listbox" aria-label="Mentionner un membre">
                            {suggestions.map((m, i) => (
                                <li key={m.id} role="option" aria-selected={i === mention.index}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => { e.preventDefault(); pick(m); }}
                                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${i === mention.index ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <Avatar name={m.name} size="xs" className="ring-0" />
                                        {m.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
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
