<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Event;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Task;
use App\Support\Trash;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrashController extends Controller
{
    private function activeProject(): Project
    {
        $project = Project::find(session('active_project_id'));
        abort_unless($project && $project->isMember(auth()->user()), 403);

        return $project;
    }

    public function index()
    {
        $project = $this->activeProject();
        $pid = $project->id;
        $row = fn ($item, string $type, string $label, ?string $meta = null) => [
            'type'       => $type,
            'id'         => $item->id,
            'label'      => $label,
            'meta'       => $meta,
            'deleted_at' => $item->deleted_at,
            'deleted_by' => $item->deleter?->name,
            'purge_at'   => $item->deleted_at->copy()->addDays(Task::TRASH_DAYS),
        ];

        // Tâches : seulement celles supprimées « en tête » (pas les sous-tâches emportées avec leur parent).
        $tasks = Task::onlyTrashed()->where('project_id', $pid)->with('deleter:id,name')->get();
        $trashedIds = $tasks->pluck('id');
        $tasks = $tasks->reject(fn ($t) => $t->parent_task_id && $trashedIds->contains($t->parent_task_id)
            && optional($tasks->firstWhere('id', $t->parent_task_id))->deleted_at?->eq($t->deleted_at));

        $items = collect()
            ->merge($tasks->map(fn ($t) => $row($t, 'task', $t->title, 'Tâche')))
            ->merge(Budget::onlyTrashed()->where('project_id', $pid)->with('deleter:id,name')->get()->map(fn ($b) => $row($b, 'budget', $b->name, 'Budget')))
            ->merge(ProjectFile::onlyTrashed()->where('project_id', $pid)->with('deleter:id,name')->get()->map(fn ($f) => $row($f, 'file', $f->name, 'Fichier')))
            ->merge(Event::onlyTrashed()->where('project_id', $pid)->with('deleter:id,name')->get()->map(fn ($e) => $row($e, 'event', $e->title, 'Événement')))
            ->sortByDesc('deleted_at')->values();

        return Inertia::render('Trash/Index', [
            'items'     => $items,
            'canEdit'   => $project->canEdit(auth()->user()),
            'canPurge'  => $project->isAdmin(auth()->user()),
            'days'      => Task::TRASH_DAYS,
        ]);
    }

    public function restore(Request $request, string $type, int $id)
    {
        $item = Trash::find($type, $id);
        $project = Trash::projectOf($item);
        abort_unless($project, 404);

        if ($type === 'project') {
            abort_unless($project->owner_id === auth()->id(), 403);
        } else {
            abort_unless(!$project->trashed() && $project->canEdit(auth()->user()), 403);
        }

        if (!$item->trashed()) {
            return back();
        }
        Trash::restore($item);

        if ($type === 'project') {
            return redirect()->route('projects.dashboard', $project)->with('success', "« {$project->name} » a été restauré.");
        }

        return back()->with('success', 'Élément restauré.');
    }

    public function destroy(string $type, int $id)
    {
        $item = Trash::find($type, $id);
        $project = Trash::projectOf($item);
        abort_unless($item->trashed() && $project, 404);
        abort_unless($type === 'project' ? $project->owner_id === auth()->id() : $project->isAdmin(auth()->user()), 403);

        $item->forceDelete();

        return back()->with('success', 'Supprimé définitivement.');
    }
}
