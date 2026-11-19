import { Head, Link } from '@inertiajs/react';

function Section({ title, children }) {
    return (
        <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <div className="mt-3 space-y-3 text-gray-600 leading-relaxed">{children}</div>
        </section>
    );
}

function Privacy({ contact }) {
    return (
        <>
            <Section title="Données collectées">
                <p>
                    WorkSpace collecte uniquement les données nécessaires à son fonctionnement : votre nom, votre
                    adresse e-mail, votre mot de passe (chiffré) et les contenus que vous créez dans l'application
                    (projets, tâches, événements, budgets, fichiers, commentaires).
                </p>
                <p>
                    Si vous vous connectez avec Google, nous recevons de Google votre nom, votre adresse e-mail,
                    votre photo de profil et un identifiant de compte Google. Nous n'accédons à aucune autre donnée
                    de votre compte Google.
                </p>
            </Section>
            <Section title="Utilisation des données">
                <p>
                    Ces données servent uniquement à créer et sécuriser votre compte, à vous permettre de collaborer
                    avec les membres de vos projets et équipes, et à vous envoyer les e-mails liés au service
                    (vérification d'adresse, réinitialisation du mot de passe).
                </p>
                <p>Elles ne sont jamais vendues, louées ni utilisées à des fins publicitaires.</p>
            </Section>
            <Section title="Hébergement et conservation">
                <p>
                    Les données sont hébergées sur un serveur situé dans l'Union européenne. Elles sont conservées
                    tant que votre compte existe et supprimées lorsque vous supprimez votre compte.
                </p>
            </Section>
            <Section title="Vos droits">
                <p>
                    Conformément au RGPD, vous pouvez accéder à vos données, les corriger, les exporter ou demander
                    leur suppression. Vous pouvez également retirer l'accès de WorkSpace à votre compte Google à tout
                    moment depuis les paramètres de sécurité de votre compte Google.
                </p>
                {contact && (
                    <p>
                        Pour toute demande : <a className="text-indigo-600 hover:underline" href={`mailto:${contact}`}>{contact}</a>
                    </p>
                )}
            </Section>
        </>
    );
}

function Terms({ contact }) {
    return (
        <>
            <Section title="Objet">
                <p>
                    WorkSpace est une application de gestion de projets (tâches, calendrier, équipes, budgets)
                    proposée gratuitement. En créant un compte, vous acceptez les présentes conditions.
                </p>
            </Section>
            <Section title="Compte">
                <p>
                    Vous êtes responsable de la confidentialité de vos identifiants et de l'activité réalisée depuis
                    votre compte. Vous pouvez supprimer votre compte à tout moment.
                </p>
            </Section>
            <Section title="Utilisation acceptable">
                <p>
                    Vous vous engagez à ne pas utiliser WorkSpace pour stocker ou partager des contenus illicites,
                    ni pour perturber le fonctionnement du service.
                </p>
            </Section>
            <Section title="Disponibilité et responsabilité">
                <p>
                    Le service est fourni « en l'état », sans garantie de disponibilité continue. Pensez à conserver
                    une copie de vos données importantes.
                </p>
            </Section>
            <Section title="Contact">
                <p>
                    Voir aussi la <Link href={route('legal.privacy')} className="text-indigo-600 hover:underline">politique de confidentialité</Link>.
                    {contact && (
                        <> Pour toute question : <a className="text-indigo-600 hover:underline" href={`mailto:${contact}`}>{contact}</a></>
                    )}
                </p>
            </Section>
        </>
    );
}

export default function Legal({ page, contact, updatedAt }) {
    const title = page === 'privacy' ? 'Politique de confidentialité' : "Conditions d'utilisation";

    return (
        <div className="min-h-screen bg-white">
            <Head title={title} />
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                <Link href="/" className="text-sm font-bold text-indigo-600">← WorkSpace</Link>
                <h1 className="mt-6 text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-sm text-gray-400">Dernière mise à jour : {updatedAt}</p>
                {page === 'privacy' ? <Privacy contact={contact} /> : <Terms contact={contact} />}
            </div>
        </div>
    );
}
