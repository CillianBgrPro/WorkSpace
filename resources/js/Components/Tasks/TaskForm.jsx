import { useForm } from '@inertiajs/react';
import Field, { Input, Textarea, Select } from '@/Components/ui/Field';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import Kbd, { modKey } from '@/Components/ui/Kbd';
import { STATUSES, PRIORITIES, normalizeStatus } from '@/lib/taskMeta';
import { toInputDate } from '@/lib/format';
import AssigneePicker from '@/Components/Tasks/AssigneePicker';

/**
 * Formulaire de tâche (création et édition). Il soumet lui-même pour que
 * les erreurs de validation s'affichent sous chaque champ.
 */
export default function TaskForm({ task = null, defaults = {}, users = [], parentTasks = [], action, method = 'post', submitLabel = 'Enregistrer', cancelHref }) {
    const { data, setData, errors, processing, submit } = useForm({
        title: task?.title ?? '',
        description: task?.description ?? '',
        specification: task?.specification ?? '',
        status: normalizeStatus(task?.status ?? defaults.status ?? 'todo'),
        priority: task?.priority ?? 'medium',
        due_date: toInputDate(task?.due_date),
        assignee_ids: task?.assigned_users?.length ? task.assigned_users.map((u) => u.id) : task?.assignee_id ? [task.assignee_id] : [],
        parent_task_id: task?.parent_task_id ?? defaults.parent_task_id ?? '',
    });

    const onSubmit = (e) => {
        e.preventDefault();
        submit(method, action, { preserveScroll: true });
    };

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            {/* Contenu */}
            <Card className="space-y-5">
                <Field label="Titre" required error={errors.title}>
                    {(p) => (
                        <Input
                            {...p}
                            autoFocus={!task}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Ex. Intégrer la page d'accueil"
                            maxLength={255}
                            className="text-base"
                        />
                    )}
                </Field>

                <Field label="Description" optional error={errors.description} hint="Le contexte en quelques lignes : ce qu'il faut faire et pourquoi.">
                    {(p) => <Textarea {...p} rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} />}
                </Field>

                <Field label="Cahier des charges" optional error={errors.specification} hint="Critères d'acceptation, liens, détails techniques…">
                    {(p) => <Textarea {...p} rows={6} value={data.specification} onChange={(e) => setData('specification', e.target.value)} />}
                </Field>
            </Card>

            {/* Propriétés */}
            <div className="space-y-5">
                <Card className="space-y-4">
                    <Field label="Statut" error={errors.status}>
                        {(p) => (
                            <Select {...p} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                {Object.entries(STATUSES).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                            </Select>
                        )}
                    </Field>

                    <Field label="Priorité" error={errors.priority}>
                        {(p) => (
                            <Select {...p} value={data.priority} onChange={(e) => setData('priority', e.target.value)}>
                                {Object.entries(PRIORITIES).map(([k, pr]) => <option key={k} value={k}>{pr.label}</option>)}
                            </Select>
                        )}
                    </Field>

                    <Field label="Échéance" optional error={errors.due_date}>
                        {(p) => <Input {...p} type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />}
                    </Field>

                    <Field label="Assignés" optional error={errors.assignee_ids || errors.assignee_id} hint="Ils seront notifiés.">
                        {(p) => <AssigneePicker id={p.id} users={users} value={data.assignee_ids} onChange={(v) => setData('assignee_ids', v)} />}
                    </Field>

                    <Field label="Sous-tâche de" optional error={errors.parent_task_id}>
                        {(p) => (
                            <Select {...p} value={data.parent_task_id ?? ''} onChange={(e) => setData('parent_task_id', e.target.value)}>
                                <option value="">Aucune (tâche principale)</option>
                                {parentTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </Select>
                        )}
                    </Field>
                </Card>

                <div className="flex flex-col gap-2 sm:flex-row-reverse lg:flex-col">
                    <Button type="submit" loading={processing} className="w-full sm:w-auto lg:w-full">
                        {submitLabel}
                    </Button>
                    {cancelHref && (
                        <Button variant="secondary" href={cancelHref} className="w-full sm:w-auto lg:w-full">Annuler</Button>
                    )}
                    <p className="hidden items-center justify-center gap-1 text-xs text-gray-400 lg:flex">
                        <Kbd>{modKey}</Kbd><Kbd>↵</Kbd> pour enregistrer
                    </p>
                </div>
            </div>
        </form>
    );
}
