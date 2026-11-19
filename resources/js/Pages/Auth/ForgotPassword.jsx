import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/Auth/AuthField';
import Button from '@/Components/ui/Button';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            <Link href={route('login')} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
                <ChevronLeftIcon className="h-4 w-4" /> Retour à la connexion
            </Link>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mot de passe oublié ?</h1>
            <p className="mb-8 text-gray-500">Indiquez votre e-mail : nous vous envoyons un lien pour en choisir un nouveau.</p>

            {status && (
                <div className="mb-6 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5" noValidate>
                <AuthField
                    label="Adresse e-mail"
                    icon={EnvelopeIcon}
                    type="email"
                    name="email"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />
                <Button type="submit" size="lg" loading={processing} className="w-full">Envoyer le lien</Button>
            </form>
        </GuestLayout>
    );
}
