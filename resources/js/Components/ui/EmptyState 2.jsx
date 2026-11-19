export default function EmptyState({ icon: Icon, title, description, action, compact = false, className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 text-center ${compact ? 'px-4 py-6' : 'px-6 py-12'} ${className}`}>
            {Icon && (
                <div className={`mb-3 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500 ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}>
                    <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
                </div>
            )}
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
