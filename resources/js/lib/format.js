// Formats d'affichage partagés (dates, montants, échéances) — toujours en français.

const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    // « 2026-11-20 » doit rester le 20 quel que soit le fuseau.
    const s = String(value);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00`) : new Date(s.replace(' ', 'T'));
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    const d = toDate(value);
    if (!d || isNaN(d)) return '—';
    return d.toLocaleDateString('fr-FR', options);
}

export function formatShortDate(value) {
    const d = toDate(value);
    if (!d || isNaN(d)) return '—';
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleDateString('fr-FR', sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
    const d = toDate(value);
    if (!d || isNaN(d)) return '—';
    return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** « il y a 5 min », « hier », « il y a 3 j »… */
export function formatRelative(value) {
    const d = toDate(value);
    if (!d || isNaN(d)) return '';
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 45) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.round(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.round(diff / 3600)} h`;
    const days = Math.round(diff / 86400);
    if (days === 1) return 'hier';
    if (days < 7) return `il y a ${days} j`;
    return formatShortDate(d);
}

export function formatMoney(value, { decimals = 2 } = {}) {
    const n = Number(value ?? 0);
    return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Infos d'échéance : libellé lisible + ton (danger / warning / neutral). */
export function dueInfo(value, { done = false } = {}) {
    const d = toDate(value);
    if (!d || isNaN(d)) return null;
    const days = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000);
    let label;
    if (days === 0) label = "Aujourd'hui";
    else if (days === 1) label = 'Demain';
    else if (days === -1) label = 'Hier';
    else if (days < 0) label = `En retard de ${-days} j`;
    else if (days < 7) label = d.toLocaleDateString('fr-FR', { weekday: 'long' });
    else label = formatShortDate(d);
    label = label.charAt(0).toUpperCase() + label.slice(1);

    let tone = 'neutral';
    if (!done && days < 0) tone = 'danger';
    else if (!done && days <= 1) tone = 'warning';
    return { label, tone, days, full: formatDate(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) };
}

export function toInputDate(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}
