export function Card({ as: Tag = 'div', className = '', padded = true, children, ...props }) {
    return (
        <Tag className={`rounded-xl border border-gray-200/80 bg-white shadow-sm ${padded ? 'p-4 sm:p-5' : ''} ${className}`} {...props}>
            {children}
        </Tag>
    );
}

export function CardHeader({ title, description, icon: Icon, actions, className = '' }) {
    return (
        <div className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
            <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    {Icon && <Icon className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />}
                    <span className="truncate">{title}</span>
                </h2>
                {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
    );
}

export default Card;
