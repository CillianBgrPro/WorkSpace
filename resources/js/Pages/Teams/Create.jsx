import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/ui/PageHeader';
import Button from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import Field, { Input, Textarea } from '@/Components/ui/Field';

export default function TeamCreate() {
    const { data, setData, post, processing, errors } = useForm({ name: '', description: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/teams');
    };

    return (
        <AppLayout header="Nouvelle équipe">
            <Head title="Nouvelle équipe" />
            <PageHeader
                title="Nouvelle équipe"
                description="Vous pourrez ajouter les membres juste après."
                back={{ href: '/teams', label: 'Équipes' }}
            />

            <form onSubmit={submit} className="max-w-2xl space-y-5">
                <Card className="space-y-5">
                    <Field label="Nom de l'équipe" required error={errors.name}>
                        {(p) => <Input {...p} autoFocus value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ex. Front-end" />}
                    </Field>
                    <Field label="Description" optional error={errors.description}>
                        {(p) => <Textarea {...p} rows={3} value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Rôle de l'équipe dans le projet" />}
                    </Field>
                </Card>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" href="/teams">Annuler</Button>
                    <Button type="submit" loading={processing}>Créer l'équipe</Button>
                </div>
            </form>
        </AppLayout>
    );
}
