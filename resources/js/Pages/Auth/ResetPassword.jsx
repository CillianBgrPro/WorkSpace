import { Head, useForm } from '@inertiajs/react';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/Auth/AuthField';
import Button from '@/Components/ui/Button';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Nouveau mot de passe" />

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Nouveau mot de passe</h1>
            <p className="mb-8 text-gray-500">Choisissez un mot de passe d'au moins 8 caractères.</p>

            <form onSubmit={submit} className="space-y-5" noValidate>
                <AuthField label="Adresse e-mail" icon={EnvelopeIcon} type="email" name="email" value={data.email} autoComplete="username" onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <AuthField label="Nouveau mot de passe" icon={LockClosedIcon} type="password" name="password" value={data.password} autoComplete="new-password" autoFocus onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                <AuthField label="Confirmer le mot de passe" icon={LockClosedIcon} type="password" name="password_confirmation" value={data.password_confirmation} autoComplete="new-password" onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} />
                <Button type="submit" size="lg" loading={processing} className="w-full">Enregistrer le mot de passe</Button>
            </form>
        </GuestLayout>
    );
}
