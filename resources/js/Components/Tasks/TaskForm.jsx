import { useForm } from '@inertiajs/react';

export default function TaskForm({ task = null, users = [], parentTasks = [], onSubmit, submitLabel = 'Enregistrer' }) {
    const { data, setData, errors, processing } = useForm({
        title: task?.title ?? '',
        description: task?.description ?? '',
        specification: task?.specification ?? '',
        status: task?.status ?? 'todo',
        priority: task?.priority ?? 'medium',
        due_date: task?.due_date ?? '',
        assignee_id: task?.assignee_id ?? '',
        parent_task_id: task?.parent_task_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={submit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Titre</label>
                <input
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    rows={3}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Cahier des charges</label>
                <textarea
                    value={data.specification}
                    onChange={(e) => setData('specification', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    rows={5}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Etat</label>
                    <select
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="todo">Pas commencee</option>
                        <option value="in_progress">En cours</option>
                        <option value="done">Terminee</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Priorite</label>
                    <select
                        value={data.priority}
                        onChange={(e) => setData('priority', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Haute</option>
                        <option value="critical">Critique</option>
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Deadline</label>
                    <input
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Assignee</label>
                    <select
                        value={data.assignee_id}
                        onChange={(e) => setData('assignee_id', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Non attribuee</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Sous-tache de</label>
                    <select
                        value={data.parent_task_id}
                        onChange={(e) => setData('parent_task_id', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Aucune</option>
                        {parentTasks.map((parentTask) => (
                            <option key={parentTask.id} value={parentTask.id}>
                                {parentTask.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                {submitLabel}
            </button>
        </form>
    );
}
