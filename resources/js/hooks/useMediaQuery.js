import { useEffect, useState } from 'react';

/**
 * Renvoie true tant que la media query correspond (ex. '(max-width: 767px)').
 */
export default function useMediaQuery(query) {
    const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
    const [matches, setMatches] = useState(get);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}
