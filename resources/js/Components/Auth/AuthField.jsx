import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';
import Field, { Input } from '@/Components/ui/Field';

/** Champ des pages de connexion : icône à gauche, bouton « afficher » pour les mots de passe. */
export default function AuthField({ label, icon: Icon, type = 'text', error, hint, ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';

    return (
        <Field label={label} error={error} hint={hint}>
            {(p) => (
                <>
                    <div className="relative">
                        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />}
                        <Input
                            {...p}
                            {...props}
                            type={isPassword && visible ? 'text' : type}
                            className={`h-11 ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''}`}
                        />
                        {isPassword && (
                            <button
                                type="button"
                                onClick={() => setVisible((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600"
                                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                title={visible ? 'Masquer' : 'Afficher'}
                            >
                                {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        )}
                    </div>
                </>
            )}
        </Field>
    );
}
