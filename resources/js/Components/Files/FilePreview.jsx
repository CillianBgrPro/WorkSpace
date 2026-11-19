import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import {
    XMarkIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon,
    DocumentIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';
import Button, { Spinner } from '@/Components/ui/Button';
import { previewKind, extension, parseDelimited } from '@/lib/filePreview';
import { formatRelative } from '@/lib/format';

const TEXT_LIMIT = 300 * 1024; // au-delà, on tronque l'affichage
const ROW_LIMIT = 500;

function useTextContent(url, enabled) {
    const [state, setState] = useState({ loading: true, text: '', truncated: false, error: false });

    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        setState({ loading: true, text: '', truncated: false, error: false });
        fetch(url, { credentials: 'same-origin' })
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
            .then((t) => { if (!cancelled) setState({ loading: false, text: t.slice(0, TEXT_LIMIT), truncated: t.length > TEXT_LIMIT, error: false }); })
            .catch(() => { if (!cancelled) setState({ loading: false, text: '', truncated: false, error: true }); });
        return () => { cancelled = true; };
    }, [url, enabled]);

    return state;
}

function Centered({ children }) {
    return <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">{children}</div>;
}

function Fallback({ file, downloadUrl, message }) {
    return (
        <Centered>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/70">
                <DocumentIcon className="h-8 w-8" />
            </span>
            <p className="text-base font-medium text-white">{message ?? 'Aperçu indisponible pour ce format'}</p>
            <p className="max-w-sm text-sm text-white/60">
                {extension(file.name) ? `Les fichiers .${extension(file.name)} s'ouvrent avec leur application.` : 'Téléchargez le fichier pour l’ouvrir.'}
            </p>
            <Button href={downloadUrl} external icon={ArrowDownTrayIcon} className="mt-2">Télécharger</Button>
        </Centered>
    );
}

function ImageView({ url, name }) {
    const [zoomed, setZoomed] = useState(false);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { setZoomed(false); setLoaded(false); }, [url]);

    return (
        <div className={`relative h-full ${zoomed ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden p-4'}`}>
            {!loaded && <div className="absolute inset-0 flex items-center justify-center"><Spinner className="h-8 w-8 text-white/60" /></div>}
            <img
                src={url}
                alt={name}
                onLoad={() => setLoaded(true)}
                onClick={() => setZoomed((z) => !z)}
                className={`select-none transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'} ${
                    zoomed ? 'max-w-none cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in rounded-lg object-contain shadow-2xl'
                }`}
            />
            {loaded && (
                <button
                    type="button"
                    onClick={() => setZoomed((z) => !z)}
                    className="absolute bottom-4 right-4 rounded-full bg-black/60 p-2 text-white/80 hover:text-white"
                    aria-label={zoomed ? 'Ajuster à l’écran' : 'Taille réelle'}
                    title={zoomed ? 'Ajuster à l’écran' : 'Taille réelle'}
                >
                    {zoomed ? <MagnifyingGlassMinusIcon className="h-5 w-5" /> : <MagnifyingGlassPlusIcon className="h-5 w-5" />}
                </button>
            )}
        </div>
    );
}

function TextView({ url, file, downloadUrl }) {
    const { loading, text, truncated, error } = useTextContent(url, true);
    if (loading) return <Centered><Spinner className="h-8 w-8 text-white/60" /></Centered>;
    if (error) return <Fallback file={file} downloadUrl={downloadUrl} message="Impossible de charger le contenu" />;

    const lines = text.split('\n');
    return (
        <div className="h-full overflow-auto p-3 sm:p-6">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
                <pre className="overflow-x-auto py-4 text-[13px] leading-6 text-gray-800">
                    <code className="table w-full font-mono">
                        {lines.map((line, i) => (
                            <span key={i} className="table-row hover:bg-gray-50">
                                <span className="table-cell w-12 select-none pr-4 text-right text-gray-300">{i + 1}</span>
                                <span className="table-cell whitespace-pre-wrap break-all pr-4">{line || ' '}</span>
                            </span>
                        ))}
                    </code>
                </pre>
                {truncated && <p className="border-t border-gray-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">Aperçu tronqué — téléchargez le fichier pour le voir en entier.</p>}
            </div>
        </div>
    );
}

function TableView({ url, file, downloadUrl }) {
    const { loading, text, error } = useTextContent(url, true);
    if (loading) return <Centered><Spinner className="h-8 w-8 text-white/60" /></Centered>;
    if (error) return <Fallback file={file} downloadUrl={downloadUrl} message="Impossible de charger le contenu" />;

    const rows = parseDelimited(text, extension(file.name) === 'tsv' ? '\t' : undefined);
    if (!rows.length) return <Fallback file={file} downloadUrl={downloadUrl} message="Fichier vide" />;
    const [head, ...body] = rows;

    return (
        <div className="h-full overflow-auto p-3 sm:p-6">
            <div className="mx-auto max-w-6xl overflow-auto rounded-xl bg-white shadow-2xl">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                        <tr>{head.map((h, i) => <th key={i} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-700">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {body.slice(0, ROW_LIMIT).map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                {head.map((_, j) => <td key={j} className="whitespace-nowrap px-3 py-1.5 text-gray-700">{r[j]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                    {body.length > ROW_LIMIT ? `${ROW_LIMIT} premières lignes sur ${body.length}` : `${body.length} ligne${body.length > 1 ? 's' : ''}`} · {head.length} colonne{head.length > 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
}

function Body({ file, previewUrl, downloadUrl }) {
    const kind = previewKind(file.name);
    switch (kind) {
        case 'image':
            return <ImageView url={previewUrl} name={file.name} />;
        case 'pdf':
            return <iframe key={previewUrl} src={previewUrl} title={file.name} className="h-full w-full bg-white" />;
        case 'video':
            return <Centered><video key={previewUrl} src={previewUrl} controls playsInline className="max-h-full max-w-full rounded-lg shadow-2xl" /></Centered>;
        case 'audio':
            return <Centered><DocumentIcon className="h-10 w-10 text-white/40" /><audio key={previewUrl} src={previewUrl} controls className="w-full max-w-md" /></Centered>;
        case 'table':
            return <TableView url={previewUrl} file={file} downloadUrl={downloadUrl} />;
        case 'text':
            return <TextView url={previewUrl} file={file} downloadUrl={downloadUrl} />;
        default:
            return <Fallback file={file} downloadUrl={downloadUrl} />;
    }
}

/**
 * Visionneuse plein écran. ← / → pour passer d'un fichier à l'autre, Échap pour fermer.
 */
export default function FilePreview({ files, index, onIndexChange, onClose, formatSize }) {
    const file = index != null ? files[index] : null;
    const total = files.length;

    useEffect(() => {
        if (!file) return;
        const onKey = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
            if (e.key === 'ArrowRight' && index < total - 1) onIndexChange(index + 1);
            if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [file, index, total]);

    if (!file) return null;

    const previewUrl = route('projects.files.preview', file.id);
    const downloadUrl = route('projects.files.download', file.id);
    const canOpen = previewKind(file.name) !== null;

    const NavButton = ({ dir }) => {
        const target = index + dir;
        const disabled = target < 0 || target >= total;
        const Icon = dir < 0 ? ChevronLeftIcon : ChevronRightIcon;
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => onIndexChange(target)}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label={dir < 0 ? 'Fichier précédent' : 'Fichier suivant'}
                title={dir < 0 ? 'Précédent (←)' : 'Suivant (→)'}
            >
                <Icon className="h-5 w-5" />
            </button>
        );
    };

    return (
        <Dialog open onClose={onClose} className="relative z-[60]">
            <DialogBackdrop className="fixed inset-0 bg-gray-950/90 backdrop-blur-sm" />
            <DialogPanel className="fixed inset-0 flex flex-col">
                {/* Barre supérieure */}
                <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2.5 text-white sm:px-4">
                    <div className="min-w-0 flex-1">
                        <DialogTitle className="truncate text-sm font-semibold sm:text-base">{file.name}</DialogTitle>
                        <p className="truncate text-xs text-white/50">
                            {formatSize(file.size)}
                            {file.user?.name && ` · ${file.user.name}`}
                            {file.created_at && ` · ${formatRelative(file.created_at)}`}
                            {total > 1 && ` · ${index + 1} / ${total}`}
                        </p>
                    </div>
                    {total > 1 && (
                        <div className="hidden items-center sm:flex">
                            <NavButton dir={-1} />
                            <NavButton dir={1} />
                        </div>
                    )}
                    {canOpen && (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" className={`${previewKind(file.name) === 'pdf' ? 'inline-flex' : 'hidden sm:inline-flex'} rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white`} title="Ouvrir dans un nouvel onglet" aria-label="Ouvrir dans un nouvel onglet">
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </a>
                    )}
                    <a href={downloadUrl} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" title="Télécharger" aria-label="Télécharger">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </a>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Fermer" title="Fermer (Échap)">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="min-h-0 flex-1" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                    <Body file={file} previewUrl={previewUrl} downloadUrl={downloadUrl} />
                </div>

                {/* Navigation mobile */}
                {total > 1 && (
                    <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden">
                        <NavButton dir={-1} />
                        <span className="text-xs text-white/60">{index + 1} / {total}</span>
                        <NavButton dir={1} />
                    </div>
                )}
            </DialogPanel>
        </Dialog>
    );
}
