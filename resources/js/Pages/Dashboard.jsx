import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AppLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="text-gray-700 dark:text-gray-200">
                <h2 className="text-2xl font-bold mb-4">Bienvenue</h2>
                <p>Votre tableau de bord est prêt.</p>
            </div>
        </AppLayout>
    );
}
