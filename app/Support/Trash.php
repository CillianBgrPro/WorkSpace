<?php

namespace App\Support;

use App\Models\Budget;
use App\Models\Event;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;

/** Corbeille : types restaurables et opérations groupées (tâche + sous-tâches). */
class Trash
{
    public const TYPES = [
        'task'    => Task::class,
        'budget'  => Budget::class,
        'file'    => ProjectFile::class,
        'event'   => Event::class,
        'project' => Project::class,
    ];

    public static function find(string $type, int $id): Model
    {
        abort_unless(isset(self::TYPES[$type]), 404);

        return self::TYPES[$type]::withTrashed()->findOrFail($id);
    }

    /** Toutes les sous-tâches (récursivement) d'une tâche, corbeille comprise. */
    public static function descendants(Task $task): array
    {
        $ids = [];
        $frontier = [$task->id];
        while ($frontier) {
            $children = Task::withTrashed()->whereIn('parent_task_id', $frontier)->pluck('id')->all();
            $children = array_diff($children, $ids);
            $ids = array_merge($ids, $children);
            $frontier = $children;
        }

        return $ids;
    }

    public static function deleteTask(Task $task): void
    {
        $at = now();
        $ids = array_merge([$task->id], self::descendants($task));
        Task::whereIn('id', $ids)->whereNull('deleted_at')->update(['deleted_at' => $at, 'deleted_by' => auth()->id()]);
    }

    public static function restore(Model $item): void
    {
        if ($item instanceof Task) {
            // On restaure avec elle les sous-tâches supprimées en même temps.
            $ids = self::descendants($item);
            Task::withTrashed()->whereIn('id', $ids)->where('deleted_at', $item->deleted_at)->restore();
            // Une sous-tâche dont la tâche parente est encore à la corbeille redevient tâche principale.
            if ($item->parent_task_id && !Task::find($item->parent_task_id)) {
                $item->parent_task_id = null;
            }
        }
        $item->restore();
    }

    public static function projectOf(Model $item): ?Project
    {
        return $item instanceof Project ? $item : Project::withTrashed()->find($item->project_id);
    }
}
