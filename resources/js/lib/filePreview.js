// Type d'aperçu d'un fichier, d'après son extension.
// Doit rester aligné sur ProjectFileController::previewContentType().

const KINDS = {
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg'],
    pdf: ['pdf'],
    video: ['mp4', 'webm', 'mov', 'ogv'],
    audio: ['mp3', 'wav', 'ogg', 'm4a'],
    table: ['csv', 'tsv'],
    text: [
        'txt', 'md', 'markdown', 'json', 'xml', 'yml', 'yaml', 'log', 'ini', 'env',
        'js', 'jsx', 'ts', 'tsx', 'php', 'py', 'rb', 'java', 'c', 'h', 'cpp', 'cs', 'go', 'rs', 'swift', 'kt',
        'sql', 'sh', 'css', 'scss', 'html', 'htm', 'vue', 'svelte',
    ],
};

export function extension(name = '') {
    const i = name.lastIndexOf('.');
    return i > -1 ? name.slice(i + 1).toLowerCase() : '';
}

/** 'image' | 'pdf' | 'video' | 'audio' | 'table' | 'text' | null */
export function previewKind(name) {
    const ext = extension(name);
    return Object.keys(KINDS).find((k) => KINDS[k].includes(ext)) ?? null;
}

export const isPreviewable = (name) => previewKind(name) !== null;

/** Découpe un CSV/TSV simple (guillemets gérés) en lignes de cellules. */
export function parseDelimited(text, delimiter) {
    const sep = delimiter ?? (text.split('\n', 1)[0].split(';').length > text.split('\n', 1)[0].split(',').length ? ';' : ',');
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (c === '"') quoted = false;
            else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === sep) { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((v) => v !== ''));
}
