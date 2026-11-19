export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const modKey = isMac ? '⌘' : 'Ctrl';

export default function Kbd({ children, className = '' }) {
    return (
        <kbd className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1 font-sans text-[11px] font-medium text-gray-500 ${className}`}>
            {children}
        </kbd>
    );
}
