<?php

namespace App\Console\Commands;

use App\Support\Trash;
use Illuminate\Console\Command;

/** Vide la corbeille des éléments supprimés depuis plus de 30 jours. */
class PurgeTrash extends Command
{
    protected $signature = 'trash:purge';

    protected $description = 'Supprime définitivement les éléments de la corbeille de plus de 30 jours';

    public function handle(): int
    {
        $limit = now()->subDays(\App\Models\Task::TRASH_DAYS);
        $count = 0;

        // Projets d'abord (ils emportent leur contenu), puis le reste.
        foreach (['project', 'task', 'budget', 'file', 'event'] as $type) {
            $class = Trash::TYPES[$type];
            $class::onlyTrashed()->where('deleted_at', '<', $limit)
                ->when($type === 'task', fn ($q) => $q->orderByDesc('parent_task_id'))
                ->get()
                ->each(function ($item) use (&$count) {
                    // Peut déjà avoir été emporté par la suppression de son projet ou de sa tâche parente.
                    if ($item::withTrashed()->whereKey($item->getKey())->exists()) {
                        $item->forceDelete();
                        $count++;
                    }
                });
        }

        $this->info("{$count} élément(s) supprimé(s) définitivement.");

        return self::SUCCESS;
    }
}
