import { CalendarIcon } from '@heroicons/react/16/solid';
import { STATUSES, PRIORITIES, normalizeStatus } from '@/lib/taskMeta';
import { dueInfo } from '@/lib/format';

export function Badge({ className = 'bg-gray-100 text-gray-700 ring-gray-200', children, title }) {
    return (
        <span title={title} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>
            {children}
        </span>
    );
}

export function StatusBadge({ status }) {
    const s = STATUSES[normalizeStatus(status)];
    return (
        <Badge className={s.badge}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
            {s.label}
        </Badge>
    );
}

/** Petites barres façon signal : lisibles d'un coup d'œil, même en noir et blanc. */
export function PriorityIcon({ priority, className = '' }) {
    const p = PRIORITIES[priority] ?? PRIORITIES.medium;
    return (
        <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${p.color} ${className}`} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={1 + i * 4} y={11 - i * 3} width="2.5" height={4 + i * 3} rx="0.75" fill="currentColor" opacity={i < p.bars ? 1 : 0.2} />
            ))}
        </svg>
    );
}

export function PriorityBadge({ priority, compact = false }) {
    const p = PRIORITIES[priority] ?? PRIORITIES.medium;
    if (compact) {
        return (
            <span title={`Priorité ${p.label.toLowerCase()}`} className="inline-flex">
                <PriorityIcon priority={priority} />
            </span>
        );
    }
    return (
        <Badge className={p.badge} title="Priorité">
            <PriorityIcon priority={priority} />
            {p.label}
        </Badge>
    );
}

const DUE_TONES = {
    danger: 'bg-rose-50 text-rose-700 ring-rose-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    neutral: 'bg-white text-gray-600 ring-gray-200',
};

export function DueBadge({ date, done = false }) {
    const info = dueInfo(date, { done });
    if (!info) return null;
    return (
        <Badge className={DUE_TONES[info.tone]} title={`Échéance : ${info.full}`}>
            <CalendarIcon className="h-3 w-3" aria-hidden="true" />
            {info.label}
        </Badge>
    );
}

export default Badge;
