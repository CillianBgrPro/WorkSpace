import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/ui/Button';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Vérifiez votre e-mail" />

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <EnvelopeOpenIcon className="h-6 w-6" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Vérifiez votre boîte mail</h1>
            <p className="mb-6 text-gray-500">
                Nous vous avons envoyé un lien de confirmation. Cliquez dessus pour activer votre compte — pensez à regarder dans les spams.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-6 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Un nouveau lien vient de vous être envoyé.
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" loading={processing}>Renvoyer l'e-mail</Button>
                <Link href={route('logout')} method="post" as="button" className="text-sm font-medium text-gray-500 hover:text-gray-800">
                    Se déconnecter
                </Link>
            </form>
        </GuestLayout>
    );
}
