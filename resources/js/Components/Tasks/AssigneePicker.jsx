import { CheckIcon } from '@heroicons/react/16/solid';
import Avatar from '@/Components/ui/Avatar';

/** Sélection de plusieurs assignés parmi les membres du projet (puces cliquables). */
export default function AssigneePicker({ users = [], value = [], onChange, id }) {
    const toggle = (uid) => onChange(value.includes(uid) ? value.filter((v) => v !== uid) : [...value, uid]);

    if (users.length === 0) {
        return <p className="text-sm text-gray-400">Aucun membre dans le projet.</p>;
    }

    return (
        <div id={id} className="flex flex-wrap gap-1.5" role="group" aria-label="Assignés">
            {users.map((u) => {
                const selected = value.includes(u.id);
                return (
                    <button
                        key={u.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggle(u.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium ring-1 ring-inset transition ${
                            selected ? 'bg-indigo-50 text-indigo-700 ring-indigo-300' : 'bg-white text-gray-600 ring-gray-200 hover:ring-gray-300'
                        }`}
                    >
                        <Avatar name={u.name} size="xs" className="ring-0" />
                        {u.name}
                        {selected && <CheckIcon className="h-3.5 w-3.5" />}
                    </button>
                );
            })}
        </div>
    );
}
