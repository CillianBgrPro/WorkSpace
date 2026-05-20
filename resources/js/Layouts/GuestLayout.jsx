import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex">

            <div className="hidden lg:flex lg:w-1/2 bg-[#0f0a2e] flex-col justify-between p-12">

                <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-lg">WorkSpace</span>
                </div>

                <div>
                    <span className="inline-flex items-center gap-2 border border-indigo-400/30 text-indigo-300 text-sm px-4 py-1.5 rounded-full mb-8">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Plateforme collaborative
                    </span>
                    <h1 className="text-white text-5xl font-bold leading-tight mb-4">
                        Gérez vos projets<br />
                        <span className="text-indigo-400">avec simplicité.</span>
                    </h1>
                    <p className="text-white/50 text-base leading-relaxed max-w-sm">
                        Tableau de bord, gestion d'équipe, suivi budgétaire et calendrier collaboratif — tout en un seul espace.
                    </p>

                    {/* Témoignage */}
                    <div className="mt-10 border border-white/10 rounded-2xl p-6 bg-white/5">
                        <p className="text-white/70 text-sm italic mb-4">
                            WorkSpace m’a permis de redéfinir ma façon de gérer mes projets, grâce à ses nombreux outils intelligemment pensés pour les utilisateurs.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">CB</div>
                            <div>
                                <p className="text-white text-sm font-medium">Bauger Cillian</p>
                                <p className="text-white/40 text-xs">Étudiant Web FullStack, CODA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-10">
                    {[['0+', 'Projets livrés'], ['100%', 'Satisfaction'], ['0+', 'Entreprises']].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-white text-2xl font-bold">{val}</p>
                            <p className="text-white/40 text-sm">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Colonne droite — formulaire */}
            <div className="flex-1 flex items-center justify-center px-8 bg-white">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>

        </div>
    );
}
