<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Données de la palette de commandes (Ctrl/⌘ + K) : projets et tâches du projet actif.
 */
class PaletteController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $projects = Project::query()
            ->where(fn ($q) => $q->where('owner_id', $user->id)
                ->orWhereHas('members', fn ($m) => $m->where('users.id', $user->id)))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $tasks = [];
        $activeId = session('active_project_id');
        if ($activeId && $projects->contains('id', $activeId)) {
            $tasks = Task::where('project_id', $activeId)
                ->orderByRaw("CASE WHEN status IN ('done', 'completed') THEN 1 ELSE 0 END")
                ->latest('updated_at')
                ->limit(300)
                ->get(['id', 'title', 'status', 'priority']);
        }

        return response()->json(['projects' => $projects, 'tasks' => $tasks]);
    }
}
