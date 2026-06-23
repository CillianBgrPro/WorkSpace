import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function EditBudget({ budget }) {
    const { data, setData, put, processing, errors } = useForm({
        name: budget.name || '',
        description: budget.description || '',
        amount: budget.amount || '',
        alert_threshold_percentage: budget.alert_threshold_percentage || '80',
        status: budget.status || 'active',
        start_date: budget.start_date ? budget.start_date.split('T')[0] : '',
        end_date: budget.end_date ? budget.end_date.split('T')[0] : '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/budgets/${budget.id}`);
    };

    return (
        <AppLayout header={`Modifier le budget : ${budget.name}`}>
            <Head title={`Modifier - ${budget.name}`} />

            <div className="max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Modifier les paramètres financiers</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ajustez le montant, le seuil d'alerte ou la période de validité.
                        </p>
                    </div>
                    <Link
                        href={`/budgets/${budget.id}`}
                        className="px-4 py-2 text-sm rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Retour aux détails
                    </Link>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Nom du budget *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            placeholder="ex: Budget Marketing Q3"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            rows={3}
                            placeholder="Entrez une description optionnelle..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Montant total (€) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                placeholder="0.00"
                                required
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Seuil d'alerte (%) *
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={data.alert_threshold_percentage}
                                onChange={(e) => setData('alert_threshold_percentage', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                required
                            />
                            {errors.alert_threshold_percentage && (
                                <p className="text-red-500 text-xs mt-1">{errors.alert_threshold_percentage}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Statut
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="active">Actif</option>
                                <option value="archived">Archivé</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Date de début *
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                required
                            />
                            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 text-sm shadow-sm"
                        >
                            Enregistrer les modifications
                        </button>
                        <Link
                            href={`/budgets/${budget.id}`}
                            className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition text-sm"
                        >
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
