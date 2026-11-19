import { Head, useForm } from '@inertiajs/react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthField from '@/Components/Auth/AuthField';
import Button from '@/Components/ui/Button';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirmer le mot de passe" />

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Confirmez votre identité</h1>
            <p className="mb-8 text-gray-500">Cette zone est sécurisée : saisissez votre mot de passe pour continuer.</p>

            <form onSubmit={submit} className="space-y-5" noValidate>
                <AuthField label="Mot de passe" icon={LockClosedIcon} type="password" name="password" value={data.password} autoComplete="current-password" autoFocus onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                <Button type="submit" size="lg" loading={processing} className="w-full">Confirmer</Button>
            </form>
        </GuestLayout>
    );
}
