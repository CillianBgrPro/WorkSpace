import { Head, router } from '@inertiajs/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import BudgetForm from '@/Components/Budget/BudgetForm';
import { confirmDelete } from '@/Components/ui/ConfirmDialog';

export default function EditBudget({ budget }) {
    const destroy = async () => {
        if (await confirmDelete(`le budget « ${budget.name} »`, 'Toutes ses catégories et dépenses seront supprimées. Cette action est définitive.')) {
            router.delete(`/budgets/${budget.id}`);
        }
    };

    return (
        <AppLayout header="Modifier le budget">
            <Head title={`Modifier — ${budget.name}`} />
            <PageHeader title="Modifier le budget" back={{ href: `/budgets/${budget.id}`, label: budget.name }} />

            <BudgetForm
                budget={budget}
                action={`/budgets/${budget.id}`}
                method="put"
                submitLabel="Enregistrer les modifications"
                cancelHref={`/budgets/${budget.id}`}
            />

            <Card className="mt-8 max-w-3xl border-rose-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Supprimer ce budget</h2>
                        <p className="mt-0.5 text-sm text-gray-500">Supprime aussi ses catégories et toutes ses dépenses.</p>
                    </div>
                    <Button variant="danger" icon={TrashIcon} onClick={destroy}>Supprimer</Button>
                </div>
            </Card>
        </AppLayout>
    );
}
