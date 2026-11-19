import { Head, Link, router } from '@inertiajs/react';
import { EnvelopeOpenIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import GuestLayout from '@/Layouts/GuestLayout';
import GoogleButton, { OrSeparator } from '@/Components/GoogleButton';
import Button from '@/Components/ui/Button';

export default function InvitationShow({ state, token, project, inviter, email, hasAccount, me }) {
    if (state === 'confirm') {
        return (
            <GuestLayout>
                <Head title={`Rejoindre ${project.name}`} />
                <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: project.color ?? '#6366f1' }}>
                    {project.name.charAt(0).toUpperCase()}
                </span>
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Rejoindre « {project.name} » ?</h1>
                <p className="mb-2 text-gray-500">
                    {inviter ? <><strong className="text-gray-700">{inviter}</strong> vous invite</> : 'Vous êtes invité'} à collaborer sur ce projet.
                </p>
                <p className="mb-8 text-sm text-gray-500">
                    Vous êtes connecté en tant que <strong className="text-gray-700">{me.name}</strong> ({me.email})
                    {email.toLowerCase() !== me.email.toLowerCase() && <> — l'invitation était adressée à <strong className="text-gray-700">{email}</strong></>}.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="lg" className="flex-1" onClick={() => router.post(route('invitations.accept', token))}>Rejoindre le projet</Button>
                    <Button size="lg" variant="secondary" href={route('projects.index')}>Plus tard</Button>
                </div>
            </GuestLayout>
        );
    }

    if (state !== 'pending') {
        return (
            <GuestLayout>
                <Head title="Invitation" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                    {state === 'used' ? 'Invitation déjà utilisée' : 'Invitation invalide ou expirée'}
                </h1>
                <p className="mb-8 text-gray-500">
                    {state === 'used'
                        ? 'Cette invitation a déjà été acceptée. Connectez-vous pour retrouver le projet.'
                        : 'Le lien a peut-être expiré (14 jours) ou été annulé. Demandez à la personne qui vous a invité de vous renvoyer une invitation.'}
                </p>
                <Button href={route('login')} size="lg" className="w-full">Se connecter</Button>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title={`Rejoindre ${project.name}`} />

            <div className="mb-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: project.color ?? '#6366f1' }}>
                    {project.name.charAt(0).toUpperCase()}
                </span>
                <EnvelopeOpenIcon className="h-6 w-6 text-gray-300" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Rejoindre « {project.name} »</h1>
            <p className="mb-8 text-gray-500">
                {inviter ? <><strong className="text-gray-700">{inviter}</strong> vous invite</> : 'Vous êtes invité'} à collaborer sur ce projet.
                {' '}Invitation envoyée à <strong className="text-gray-700">{email}</strong>.
            </p>

            <GoogleButton label={hasAccount ? 'Continuer avec Google' : "S'inscrire avec Google"} intent={hasAccount ? 'login' : 'register'} />
            <OrSeparator />

            {hasAccount ? (
                <Button href={route('login')} size="lg" className="w-full">Se connecter pour rejoindre</Button>
            ) : (
                <>
                    <Button href={`${route('register')}?email=${encodeURIComponent(email)}`} size="lg" className="w-full">Créer mon compte</Button>
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Déjà un compte avec une autre adresse ?{' '}
                        <Link href={route('login')} className="font-medium text-indigo-600 hover:underline">Se connecter</Link>
                    </p>
                </>
            )}
            <p className="mt-6 text-center text-xs text-gray-400">Vous rejoindrez le projet automatiquement après la connexion.</p>
        </GuestLayout>
    );
}
