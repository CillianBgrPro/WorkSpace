import { forwardRef } from 'react';
import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-300',
    secondary: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:text-gray-400',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus-visible:outline-rose-600 disabled:bg-rose-300',
    'danger-ghost': 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
};

const SIZES = {
    xs: 'h-7 px-2 text-xs gap-1 rounded-md',
    sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
    md: 'h-10 px-4 text-sm gap-2 rounded-lg',
    lg: 'h-11 px-5 text-base gap-2 rounded-xl',
    icon: 'h-9 w-9 justify-center rounded-lg',
    'icon-sm': 'h-8 w-8 justify-center rounded-lg',
};

export function Spinner({ className = 'h-4 w-4' }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

/**
 * Bouton unique de l'application.
 * - `href` → lien Inertia (ou <a> natif si `external`/`download`)
 * - `icon` → icône Heroicons à gauche, `loading` → spinner + désactivé
 */
const Button = forwardRef(function Button(
    { variant = 'primary', size = 'md', href, external = false, icon: Icon, iconRight: IconRight, loading = false, className = '', children, disabled, ...props },
    ref,
) {
    const classes = `inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
    const iconSize = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4';
    const content = (
        <>
            {loading ? <Spinner className={iconSize} /> : Icon && <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />}
            {children}
            {IconRight && <IconRight className={`${iconSize} shrink-0`} aria-hidden="true" />}
        </>
    );

    if (href) {
        if (external) {
            return <a ref={ref} href={href} className={classes} {...props}>{content}</a>;
        }
        return <Link ref={ref} href={href} className={classes} {...props}>{content}</Link>;
    }

    return (
        <button ref={ref} type="button" disabled={disabled || loading} className={classes} {...props}>
            {content}
        </button>
    );
});

export default Button;
