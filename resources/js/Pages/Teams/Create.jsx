import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

export default function TeamCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/teams');
    };

    return (
        <AppLayout header="Nouvelle equipe">
            <Head title="Nouvelle equipe" />

            <form onSubmit={submit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Nom de l'equipe</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        rows={4}
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    Créer l'equipe
                </button>
            </form>
        </AppLayout>
    );
}
