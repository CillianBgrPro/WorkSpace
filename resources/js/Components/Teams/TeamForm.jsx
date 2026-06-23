import { useForm } from '@inertiajs/react';

export default function TeamForm({ team = null, users = [], onSubmit, submitLabel = 'Enregistrer' }) {
    const { data, setData, errors, processing } = useForm({
        name: team?.name ?? '',
        description: team?.description ?? '',
        member_id: '',
        role: 'collaborateur',
    });

    const submit = (e) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={submit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Nom de l'equipe</label>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                    rows={4}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {users.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-white">Ajouter un membre</label>
                    <div className="grid md:grid-cols-2 gap-4">
                        <select
                            value={data.member_id}
                            onChange={(e) => setData('member_id', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-gray-white"
                        >
                            <option value="">Choisir un utilisateur</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="admin">Administrateur</option>
                            <option value="chef_projet">Chef de projet</option>
                            <option value="collaborateur">Collaborateur</option>
                        </select>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                {submitLabel}
            </button>
        </form>
    );
}
