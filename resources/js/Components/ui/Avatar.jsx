const PALETTE = [
    'bg-indigo-100 text-indigo-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-800',
    'bg-rose-100 text-rose-700',
    'bg-violet-100 text-violet-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
];

const SIZES = {
    xs: 'h-5 w-5 text-[10px]',
    sm: 'h-6 w-6 text-[11px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
};

export function initials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Avatar à initiales, couleur stable dérivée du nom. */
export default function Avatar({ name = '', size = 'md', className = '', title }) {
    const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return (
        <span
            title={title ?? name}
            className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ring-2 ring-white ${PALETTE[hash % PALETTE.length]} ${SIZES[size]} ${className}`}
        >
            {initials(name)}
        </span>
    );
}

export function AvatarStack({ names = [], max = 4, size = 'sm' }) {
    const shown = names.slice(0, max);
    const rest = names.length - shown.length;
    return (
        <div className="flex -space-x-1.5">
            {shown.map((n, i) => <Avatar key={`${n}-${i}`} name={n} size={size} />)}
            {rest > 0 && (
                <span className={`inline-flex items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-600 ring-2 ring-white ${SIZES[size]}`}>
                    +{rest}
                </span>
            )}
        </div>
    );
}
