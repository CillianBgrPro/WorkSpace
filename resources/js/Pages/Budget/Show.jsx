import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';
import { formatMoney, formatDate, formatShortDate } from '@/lib/format';
import useCanEdit from '@/hooks/useCanEdit';
import { 
    TrashIcon, 
    PaperClipIcon, 
    DocumentTextIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function ShowBudget({ budget }) {
    const canEdit = useCanEdit();
    const { data, setData, post, processing, errors } = useForm({
        category_name: '',
        category_color: '#6366f1',
    });

    const { 
        data: expenseData, 
        setData: setExpenseData, 
        post: postExpense, 
        reset: resetExpense, 
        processing: processingExpense, 
        errors: errorsExpense 
    } = useForm({
        budget_id: budget.id,
        category_id: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        receipt_url: '',
        notes: '',
    });

    const addCategory = (e) => {
        e.preventDefault();
        post(`/budgets/${budget.id}/categories`, {
            preserveScroll: true,
            onSuccess: () => {
                setData({ category_name: '', category_color: '#6366f1' });
            },
        });
    };

    const deleteCategory = async (id, name) => {
        if (await confirmDelete(`la catégorie « ${name} »`, 'Toutes les dépenses de cette catégorie seront aussi supprimées. Cette action est définitive.')) {
            router.delete(`/categories/${id}`, { preserveScroll: true });
        }
    };

    const addExpense = (e) => {
        e.preventDefault();
        postExpense(`/budgets/${budget.id}/expenses`, {
            preserveScroll: true,
            onSuccess: () => {
                // On garde catégorie et date : on enchaîne souvent plusieurs saisies.
                resetExpense('description', 'amount', 'receipt_url', 'notes');
            },
        });
    };

    const deleteExpense = async (id) => {
        if (await confirmDelete('cette dépense')) {
            router.delete(`/expenses/${id}`, { preserveScroll: true });
        }
    };

    // Calculate alert status
    const isOverBudget = budget.percentage_consumed >= 100;
    const isNearLimit = budget.percentage_consumed >= budget.alert_threshold && budget.percentage_consumed < 100;

    return (
        <AppLayout header={budget.name}>
            <Head title={budget.name} />

            <div className="space-y-6">
                
                <PageHeader
                    className="!mb-0"
                    back={{ href: '/budgets', label: 'Budgets' }}
                    title={budget.name}
                    description={`${formatDate(budget.start_date)}${budget.end_date ? ` → ${formatDate(budget.end_date)}` : ' · sans date de fin'}`}
                    actions={canEdit && <Button variant="secondary" href={`/budgets/${budget.id}/edit`} icon={PencilSquareIcon}>Modifier</Button>}
                />

                {/* Main Budget Card */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</span>
                            <p className="text-gray-700">{budget.description || "Aucune description fournie."}</p>
                        </div>

                        {/* Visual Alert Badges */}
                        <div>
                            {isOverBudget ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold border border-red-200">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    Dépassement de budget
                                </span>
                            ) : isNearLimit ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold border border-yellow-200">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    Seuil critique atteint ({budget.alert_threshold}%)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Budget sous contrôle
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Main Progress Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">
                                Dépensé : <span className="font-bold text-gray-800">{formatMoney(budget.total_expenses)}</span> sur {formatMoney(budget.amount)}
                            </span>
                            <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                                {budget.percentage_consumed.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                    isOverBudget
                                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                        : isNearLimit
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(budget.percentage_consumed, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Enveloppe globale</span>
                            <span className="text-2xl font-bold text-gray-900 block mt-1">
                                {formatMoney(budget.amount)}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Dépensé</span>
                            <span className="text-2xl font-bold text-gray-900 block mt-1">
                                {formatMoney(budget.total_expenses)}
                            </span>
                        </div>
                        <div className={`rounded-xl p-4 border ${
                            budget.remaining_budget >= 0 
                                ? 'bg-green-50/50 border-green-100' 
                                : 'bg-red-50/50 border-red-100'
                        }`}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${
                                budget.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                Solde Restant
                            </span>
                            <span className={`text-2xl font-bold block mt-1 ${
                                budget.remaining_budget >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {formatMoney(budget.remaining_budget)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-panels Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    
                    {/* Left Column: Categories */}
                    <div className="lg:col-span-1 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200/80 h-fit space-y-6">
                        <div>
                            <h3 className="text-lg font-bold">Catégories</h3>
                            <p className="text-xs text-gray-400">Visualisez les dépenses par poste budgétaire.</p>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-3">
                            {budget.categories.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4 rounded-xl">
                                    Aucune catégorie.
                                </p>
                            ) : (
                                budget.categories.map((cat) => {
                                    const catShareOfBudget = budget.amount > 0 ? (cat.total_expenses / budget.amount) * 100 : 0;
                                    return (
                                        <div 
                                            key={cat.id} 
                                            className="group flex flex-col p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                                                        style={{ backgroundColor: cat.color }} 
                                                    />
                                                    <span className="font-semibold text-sm truncate max-w-[150px]">
                                                        {cat.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold">
                                                        {formatMoney(cat.total_expenses)}
                                                    </span>
                                                    {canEdit && <button 
                                                        onClick={() => deleteCategory(cat.id, cat.name)}
                                                        className="sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition"
                                                        title="Supprimer la catégorie et ses dépenses"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>}
                                                </div>
                                            </div>
                                            {/* Small Category Progress Indicator */}
                                            <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all"
                                                    style={{ 
                                                        backgroundColor: cat.color,
                                                        width: `${Math.min(catShareOfBudget, 100)}%`
                                                    }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1">
                                                Représente {catShareOfBudget.toFixed(1)}% du budget total
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Add Category Form */}
                        {canEdit && <form onSubmit={addCategory} className="pt-4 border-t border-gray-100 space-y-3">
                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Créer une catégorie</span>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nom (ex: Matériel, Serveurs)"
                                    value={data.category_name}
                                    onChange={(e) => setData('category_name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                                {errors.category_name && <p className="text-red-500 text-xs mt-1">{errors.category_name}</p>}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <input
                                        type="color"
                                        value={data.category_color}
                                        onChange={(e) => setData('category_color', e.target.value)}
                                        className="w-full h-9 p-0 bg-transparent border-0 rounded-lg cursor-pointer"
                                        title="Choisir une couleur"
                                    />
                                    {errors.category_color && <p className="text-red-500 text-xs mt-1">{errors.category_color}</p>}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>}
                    </div>

                    {/* Right Column: Transactions & Add Expense */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Panel: Add Expense */}
                        {canEdit && <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
                            <div>
                                <h3 className="text-lg font-bold">Nouvelle dépense</h3>
                                <p className="text-xs text-gray-400">Catégorie et date sont conservées pour enchaîner les saisies.</p>
                            </div>

                            <form onSubmit={addExpense} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Catégorie *</label>
                                        <select
                                            value={expenseData.category_id}
                                            onChange={(e) => setExpenseData('category_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        >
                                            <option value="">Sélectionner une catégorie</option>
                                            {budget.categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errorsExpense.category_id && <p className="text-red-500 text-xs mt-1">{errorsExpense.category_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Description *</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Facture AWS Juin"
                                            value={expenseData.description}
                                            onChange={(e) => setExpenseData('description', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                        {errorsExpense.description && <p className="text-red-500 text-xs mt-1">{errorsExpense.description}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Montant (€) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={expenseData.amount}
                                            onChange={(e) => setExpenseData('amount', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                        {errorsExpense.amount && <p className="text-red-500 text-xs mt-1">{errorsExpense.amount}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Date *</label>
                                        <input
                                            type="date"
                                            value={expenseData.date}
                                            onChange={(e) => setExpenseData('date', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                        {errorsExpense.date && <p className="text-red-500 text-xs mt-1">{errorsExpense.date}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">URL du justificatif (Reçu)</label>
                                        <input
                                            type="url"
                                            placeholder="https://ex.com/recu.pdf"
                                            value={expenseData.receipt_url}
                                            onChange={(e) => setExpenseData('receipt_url', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                        {errorsExpense.receipt_url && <p className="text-red-500 text-xs mt-1">{errorsExpense.receipt_url}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Notes ou commentaires</label>
                                        <input
                                            type="text"
                                            placeholder="Commentaire ou précisions..."
                                            value={expenseData.notes}
                                            onChange={(e) => setExpenseData('notes', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                        {errorsExpense.notes && <p className="text-red-500 text-xs mt-1">{errorsExpense.notes}</p>}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processingExpense}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Ajouter la dépense
                                </button>
                            </form>
                        </div>}

                        {/* Panel: Transaction History */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
                            <div>
                                <h3 className="text-lg font-bold">Historique des transactions</h3>
                                <p className="text-xs text-gray-400">Les plus récentes en premier.</p>
                            </div>

                            <div className="mt-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                {budget.expenses.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">Aucune dépense enregistrée sur ce budget.</p>
                                    </div>
                                ) : (
                                    budget.expenses.map((exp) => (
                                        <div 
                                            key={exp.id} 
                                            className="flex flex-col p-4 rounded-xl border border-gray-100 hover:shadow-sm transition bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center flex-wrap gap-2">
                                                        <span 
                                                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                            style={{ backgroundColor: exp.category_color }} 
                                                        />
                                                        <h4 className="font-bold text-sm leading-tight">
                                                            {exp.description}
                                                        </h4>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                            {exp.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{formatShortDate(exp.date)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-extrabold text-sm text-right shrink-0">
                                                        -{formatMoney(exp.amount)}
                                                    </span>
                                                    {canEdit && <button
                                                        onClick={() => deleteExpense(exp.id)}
                                                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                                        title="Supprimer la transaction"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>}
                                                </div>
                                            </div>

                                            {/* Details (Notes & Justificatifs) */}
                                            {(exp.notes || exp.receipt_url) && (
                                                <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col gap-2">
                                                    {exp.notes && (
                                                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                                                            <DocumentTextIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                                            <span>{exp.notes}</span>
                                                        </div>
                                                    )}
                                                    {exp.receipt_url && (
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            <PaperClipIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                                            <a 
                                                                href={exp.receipt_url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline inline-flex items-center gap-1"
                                                            >
                                                                Justificatif / Reçu de transaction
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
