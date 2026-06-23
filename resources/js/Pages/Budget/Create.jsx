import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

export default function CreateBudget() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        amount: '',
        alert_threshold_percentage: '80',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/budgets');
    };

    return (
        <AppLayout header="Nouveau budget">
            <Head title="Créer un budget" />

            <form onSubmit={submit} className="max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Nom du budget *</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        placeholder="ex: Budget Marketing Q3"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Montant total (€) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Seuil d'alerte (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={data.alert_threshold_percentage}
                            onChange={(e) => setData('alert_threshold_percentage', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Date de début *</label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        />
                        {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">Date de fin</label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Créer le budget
                    </button>
                    <a href="/budgets" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Annuler
                    </a>
                </div>
            </form>
        </AppLayout>
    );
}
