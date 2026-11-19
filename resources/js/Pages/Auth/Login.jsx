import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleButton, { OrSeparator } from '@/Components/GoogleButton';
import AuthField from '@/Components/Auth/AuthField';
import Button from '@/Components/ui/Button';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Se connecter" />

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Bon retour !</h1>
            <p className="mb-8 text-gray-500">Connectez-vous pour accéder à vos projets.</p>

            {status && (
                <div className="mb-6 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {status}
                </div>
            )}

            <GoogleButton />
            <OrSeparator />

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

                <div>
                    <AuthField
                        label="Mot de passe"
                        icon={LockClosedIcon}
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            Rester connecté
                        </label>
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </div>
                </div>

                <Button type="submit" size="lg" loading={processing} className="w-full">Se connecter</Button>

                <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link href={route('register')} className="font-medium text-indigo-600 hover:underline">Créer un compte</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
