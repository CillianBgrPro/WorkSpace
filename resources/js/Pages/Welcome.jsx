import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    //vérifie si quelqu'un est connectée grace à la classe auth
    return (
        <>
            <Head title="Accueil" />
            <div className="bg-gray-50 dark:bg-black">
                <div className="w-full max-w-2xl px-6 lg:max-w-7xl mx-auto">

                    <header className="grid grid-cols-2 items-center gap-2 py-10 lg:grid-cols-3">

                        <nav className="flex justify-end col-start-2 lg:col-start-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-md px-3 py-2 text-black dark:text-white">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="rounded-md px-3 py-2 text-black dark:text-white">
                                        Se connecter
                                    </Link>
                                    <Link href={route('register')} className="rounded-md px-3 py-2 text-black dark:text-white">
                                        S'enregistrer
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                </div>
            </div>
        </>
    );
}
