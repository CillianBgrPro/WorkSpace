import AppLayout from '@/Layouts/AppLayout';
import TaskForm from '@/Components/Tasks/TaskForm';
import { Head, router } from '@inertiajs/react';

export default function EditTask({ task, users, parentTasks }) {
    const handleSubmit = (data) => {
        router.put(`/tasks/${task.id}`, data);
    };

    return (
        <AppLayout header="Modifier la tache">
            <Head title="Modifier la tache" />
            <TaskForm
                task={task}
                users={users}
                parentTasks={parentTasks}
                onSubmit={handleSubmit}
                submitLabel="Mettre a jour"
            />
        </AppLayout>
    );
}
