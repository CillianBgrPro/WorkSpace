import AppLayout from '@/Layouts/AppLayout';
import TaskForm from '@/Components/Tasks/TaskForm';
import { Head, router } from '@inertiajs/react';

export default function CreateTask({ users, parentTasks }) {
    const handleSubmit = (data) => {
        router.post('/tasks', data);
    };

    return (
        <AppLayout header="Nouvelle tache">
            <Head title="Creer une tache" />
            <TaskForm
                users={users}
                parentTasks={parentTasks}
                onSubmit={handleSubmit}
                submitLabel="Creer la tache"
            />
        </AppLayout>
    );
}
