import { usePage } from '@inertiajs/react';

/** Droit d'édition sur le projet actif (false pour un lecteur). */
export default function useCanEdit() {
    const project = usePage().props.activeProject;
    return project ? project.can_edit !== false : true;
}
