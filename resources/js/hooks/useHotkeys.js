import { useEffect, useRef } from 'react';

const isTyping = (el) =>
    el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Raccourcis clavier simples.
 *   useHotkeys({ 'mod+k': fn, 'n': fn, '/': fn, 'g t': fn })
 * - `mod` = ⌘ sur Mac, Ctrl ailleurs
 * - les touches simples sont ignorées pendant la saisie dans un champ
 * - « g t » : séquence de deux touches (style GitHub / Linear)
 */
export default function useHotkeys(map, enabled = true) {
    const mapRef = useRef(map);
    mapRef.current = map;

    useEffect(() => {
        if (!enabled) return;
        let pending = null;
        let timer = null;

        const onKeyDown = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            const mod = e.metaKey || e.ctrlKey;
            const handlers = mapRef.current;

            if (mod && handlers[`mod+${key}`]) {
                e.preventDefault();
                handlers[`mod+${key}`](e);
                return;
            }
            if (mod || e.altKey || isTyping(document.activeElement)) return;
            // Une fenêtre modale ouverte garde la main sur le clavier.
            if (document.querySelector('[role="dialog"]')) return;

            if (pending) {
                const combo = `${pending} ${key}`;
                pending = null;
                clearTimeout(timer);
                if (handlers[combo]) {
                    e.preventDefault();
                    handlers[combo](e);
                    return;
                }
            }
            if (Object.keys(handlers).some((k) => k.startsWith(`${key} `))) {
                pending = key;
                timer = setTimeout(() => { pending = null; }, 900);
                return;
            }
            if (handlers[key]) {
                e.preventDefault();
                handlers[key](e);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => { window.removeEventListener('keydown', onKeyDown); clearTimeout(timer); };
    }, [enabled]);
}
