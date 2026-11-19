import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TaskForm from '@/Components/Tasks/TaskForm';
import PageHeader from '@/Components/ui/PageHeader';

export default function EditTask({ task, users, parentTasks }) {
    return (
        <AppLayout header="Modifier la tâche">
            <Head title={`Modifier — ${task.title}`} />
            <PageHeader title="Modifier la tâche" back={{ href: `/tasks/${task.id}`, label: task.title }} />
            <TaskForm
                task={task}
                users={users}
                parentTasks={parentTasks}
                action={`/tasks/${task.id}`}
                method="put"
                submitLabel="Enregistrer les modifications"
                cancelHref={`/tasks/${task.id}`}
            />
        </AppLayout>
    );
}
