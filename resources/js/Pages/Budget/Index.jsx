import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function BudgetIndex({ budgets }) {
    return (
        <AppLayout header="Budget">
            <Head title="Budget" />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold dark:text-white">Gestion du budget</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Visualisez et contrôlez vos dépenses.</p>
                </div>
                <Link href="/budgets/create" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                    Nouveau budget
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {budgets.map((budget) => (
                    <Link key={budget.id} href={`/budgets/${budget.id}`} className="block">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h3 className="text-lg font-semibold dark:text-white">{budget.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {budget.start_date}
                                        {budget.end_date && ` - ${budget.end_date}`}
                                    </p>
                                </div>
                                {budget.is_alert_triggered && (
                                    <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-medium">
                                        ⚠️ Alerte
                                    </span>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {budget.total_expenses.toFixed(2)}€ / {budget.amount.toFixed(2)}€
                                    </span>
                                    <span className="text-sm font-semibold dark:text-white">
                                        {budget.percentage_consumed.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition ${
                                            budget.percentage_consumed >= 100
                                                ? 'bg-red-600'
                                                : budget.percentage_consumed >= budget.alert_threshold
                                                ? 'bg-yellow-600'
                                                : 'bg-green-600'
                                        }`}
                                        style={{ width: `${Math.min(budget.percentage_consumed, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                                    <span className="text-gray-600 dark:text-gray-400 block text-xs">Restant</span>
                                    <span className="font-semibold dark:text-white">
                                        {budget.remaining_budget.toFixed(2)}€
                                    </span>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                                    <span className="text-gray-600 dark:text-gray-400 block text-xs">Dépensé</span>
                                    <span className="font-semibold dark:text-white">
                                        {budget.total_expenses.toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {budgets.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun budget créé.</p>
                    <Link href="/budgets/create" className="px-4 py-2 rounded-lg bg-indigo-600 text-white inline-block">
                        Créer un budget
                    </Link>
                </div>
            )}
        </AppLayout>
    );
}
