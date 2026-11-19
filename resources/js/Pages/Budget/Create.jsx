import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import BudgetForm from '@/Components/Budget/BudgetForm';

export default function CreateBudget() {
    return (
        <AppLayout header="Nouveau budget">
            <Head title="Nouveau budget" />
            <PageHeader
                title="Nouveau budget"
                description="Définissez une enveloppe, puis ajoutez-y des catégories et des dépenses."
                back={{ href: '/budgets', label: 'Budgets' }}
            />
            <BudgetForm action="/budgets" method="post" submitLabel="Créer le budget" cancelHref="/budgets" />
        </AppLayout>
    );
}
