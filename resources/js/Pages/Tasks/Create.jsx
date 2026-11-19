import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TaskForm from '@/Components/Tasks/TaskForm';
import PageHeader from '@/Components/ui/PageHeader';

export default function CreateTask({ users, parentTasks, defaults = {} }) {
    const parent = parentTasks.find((t) => t.id === defaults.parent_task_id);

    return (
        <AppLayout header="Nouvelle tâche">
            <Head title="Nouvelle tâche" />
            <PageHeader
                title={parent ? 'Nouvelle sous-tâche' : 'Nouvelle tâche'}
                description={parent ? `Rattachée à « ${parent.title} »` : 'Seul le titre est obligatoire : vous pourrez compléter le reste plus tard.'}
                back={parent ? { href: `/tasks/${parent.id}`, label: parent.title } : { href: '/tasks', label: 'Tâches' }}
            />
            <TaskForm
                users={users}
                parentTasks={parentTasks}
                defaults={defaults}
                action="/tasks"
                method="post"
                submitLabel="Créer la tâche"
                cancelHref={parent ? `/tasks/${parent.id}` : '/tasks'}
            />
        </AppLayout>
    );
}
