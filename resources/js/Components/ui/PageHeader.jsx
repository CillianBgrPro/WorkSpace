import { Link } from '@inertiajs/react';
import { ChevronLeftIcon } from '@heroicons/react/20/solid';

/**
 * En-tête de page : titre + description + actions, avec lien retour optionnel.
 * Sur mobile, les actions passent sous le titre et prennent toute la largeur.
 */
export default function PageHeader({ title, description, actions, back, meta, className = '' }) {
    return (
        <div className={`mb-5 sm:mb-6 ${className}`}>
            {back && (
                <Link
                    href={back.href}
                    className="mb-2 inline-flex items-center gap-1 rounded text-sm font-medium text-gray-500 transition hover:text-gray-800"
                >
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                    {back.label}
                </Link>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{title}</h1>
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                    {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2 [&>*]:flex-1 sm:[&>*]:flex-none sm:shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
