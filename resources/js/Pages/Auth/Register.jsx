import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleButton, { OrSeparator } from '@/Components/GoogleButton';
import AuthField from '@/Components/Auth/AuthField';
import Button from '@/Components/ui/Button';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        // Prérempli depuis un lien d'invitation (?email=…)
        email: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') ?? '' : '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const mismatch = data.password_confirmation && data.password !== data.password_confirmation;

    return (
        <GuestLayout>
            <Head title="Créer un compte" />

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Créer un compte</h1>
            <p className="mb-8 text-gray-500">Gratuit, sans engagement. Vous serez opérationnel en une minute.</p>

            <GoogleButton label="S'inscrire avec Google" intent="register" />
            <OrSeparator />

            <form onSubmit={submit} className="space-y-5" noValidate>
                <AuthField
                    label="Nom complet"
                    icon={UserIcon}
                    name="name"
                    value={data.name}
                    autoComplete="name"
                    autoFocus
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    placeholder="Prénom Nom"
                />
                <AuthField
                    label="Adresse e-mail"
                    icon={EnvelopeIcon}
                    type="email"
                    name="email"
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />
                <AuthField
                    label="Mot de passe"
                    icon={LockClosedIcon}
                    type="password"
                    name="password"
                    value={data.password}
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    hint="8 caractères minimum."
                />
                <AuthField
                    label="Confirmer le mot de passe"
                    icon={LockClosedIcon}
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation || (mismatch ? 'Les deux mots de passe ne correspondent pas.' : null)}
                />

                <Button type="submit" size="lg" loading={processing} className="w-full">Créer mon compte</Button>

                <p className="text-center text-xs text-gray-400">
                    En créant un compte, vous acceptez les{' '}
                    <a href={route('legal.terms')} className="underline hover:text-gray-600">conditions d'utilisation</a> et la{' '}
                    <a href={route('legal.privacy')} className="underline hover:text-gray-600">politique de confidentialité</a>.
                </p>

                <p className="text-center text-sm text-gray-500">
                    Déjà inscrit ?{' '}
                    <Link href={route('login')} className="font-medium text-indigo-600 hover:underline">Se connecter</Link>
                </p>
            </form>
        </GuestLayout>
    );
}
