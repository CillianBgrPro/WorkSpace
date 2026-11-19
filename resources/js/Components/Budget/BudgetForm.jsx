import { useForm } from '@inertiajs/react';
import Field, { Input, Textarea, Select } from '@/Components/ui/Field';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { toInputDate } from '@/lib/format';

/** Formulaire de budget partagé entre création et édition. */
export default function BudgetForm({ budget = null, action, method = 'post', submitLabel, cancelHref }) {
    const { data, setData, submit, processing, errors } = useForm({
        name: budget?.name ?? '',
        description: budget?.description ?? '',
        amount: budget?.amount ?? '',
        alert_threshold_percentage: budget?.alert_threshold_percentage ?? 80,
        status: budget?.status ?? 'active',
        start_date: toInputDate(budget?.start_date) || toInputDate(new Date().toISOString()),
        end_date: toInputDate(budget?.end_date),
    });

    const onSubmit = (e) => {
        e.preventDefault();
        submit(method, action, { preserveScroll: true });
    };

    return (
        <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
            <Card className="space-y-5">
                <Field label="Nom du budget" required error={errors.name}>
                    {(p) => <Input {...p} autoFocus={!budget} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ex. Développement V1" />}
                </Field>

                <Field label="Description" optional error={errors.description}>
                    {(p) => <Textarea {...p} rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="À quoi sert cette enveloppe ?" />}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Montant total" required error={errors.amount}>
                        {(p) => (
                            <div className="relative">
                                <Input {...p} type="number" inputMode="decimal" step="0.01" min="0" value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="0,00" className="pr-9" />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                            </div>
                        )}
                    </Field>
                    <Field label="Seuil d'alerte" error={errors.alert_threshold_percentage} hint="Vous serez alerté quand ce pourcentage est consommé.">
                        {(p) => (
                            <div className="relative">
                                <Input {...p} type="number" min="0" max="100" value={data.alert_threshold_percentage} onChange={(e) => setData('alert_threshold_percentage', e.target.value)} className="pr-9" />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                            </div>
                        )}
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Début" required error={errors.start_date}>
                        {(p) => <Input {...p} type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />}
                    </Field>
                    <Field label="Fin" optional error={errors.end_date}>
                        {(p) => <Input {...p} type="date" min={data.start_date} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />}
                    </Field>
                    <Field label="Statut" error={errors.status}>
                        {(p) => (
                            <Select {...p} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                <option value="active">Actif</option>
                                <option value="archived">Archivé</option>
                            </Select>
                        )}
                    </Field>
                </div>
            </Card>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {cancelHref && <Button variant="secondary" href={cancelHref}>Annuler</Button>}
                <Button type="submit" loading={processing}>{submitLabel}</Button>
            </div>
        </form>
    );
}
