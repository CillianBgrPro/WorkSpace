import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Se connecter" />

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h2>
            <p className="text-gray-500 mb-8">Connectez-vous pour accéder à votre espace.</p>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-5">

                <div>
                    <InputLabel htmlFor="email" value="Adresse e-mail" />
                    <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <EnvelopeIcon className="h-5 w-5" />
                        </span>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-9"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <LockClosedIcon className="h-5 w-5" />
                        </span>
                        <InputLabel htmlFor="password" value="Mot de passe" />
                        {canResetPassword && (
                            <Link href={route('password.request')} className="text-sm text-indigo-600 hover:text-indigo-500">
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <span className="text-sm text-gray-600">Rester connecté</span>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    Se connecter →
                </button>

                <p className="text-center text-sm text-gray-500">
                    Pas encore de compte ?{' '}
                    <Link href={route('register')} className="text-indigo-600 font-medium hover:underline">
                        Créer un compte
                    </Link>
                </p>

            </form>
        </GuestLayout>
    );
}
