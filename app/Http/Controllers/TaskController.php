<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Récupère le projet actif en session et vérifie l'accès.
     */
    private function getActiveProject(): ?Project
    {
        $projectId = session('active_project_id');
        if (!$projectId) {
            return null;
        }
        $project = Project::find($projectId);
        if (!$project || !$project->isMember(auth()->user())) {
            return null;
        }
        return $project;
    }

    /**
     * Projet de la tâche si l'utilisateur en est membre. Ouvrir une tâche d'un autre projet
     * (depuis « Mes tâches », une notification…) bascule le projet actif sur celui-ci.
     */
    private function projectFor(Task $task, bool $mustEdit = false, bool $switch = true): Project
    {
        $project = $task->project;
        abort_unless($project && $project->isMember(auth()->user()), 403);
        abort_if($mustEdit && !$project->canEdit(auth()->user()), 403);

        if ($switch && session('active_project_id') != $project->id) {
            session([
                'active_project_id'    => $project->id,
                'active_project_name'  => $project->name,
                'active_project_color' => $project->color,
            ]);
        }

        return $project;
    }

    /** Tâche récurrente terminée : crée l'occurrence suivante (mêmes infos, échéance décalée). */
    private function spawnNextOccurrence(Task $task): ?Task
    {
        if (!$task->recurrence || !in_array($task->status, ['done', 'completed'])) {
            return null;
        }
        $base = $task->due_date ? \Carbon\Carbon::parse($task->due_date) : now();
        $next = match ($task->recurrence) {
            'daily'   => $base->copy()->addDay(),
            'weekly'  => $base->copy()->addWeek(),
            'monthly' => $base->copy()->addMonthNoOverflow(),
            default   => null,
        };
        if (!$next) {
            return null;
        }

        $copy = $task->replicate(['status', 'due_date', 'due_reminder_sent_on', 'position']);
        $copy->status = 'todo';
        $copy->due_date = $next->toDateString();
        $copy->save();
        $copy->assignedUsers()->sync($task->assignedUsers()->pluck('users.id'));
        // La récurrence passe à la nouvelle occurrence.
        $task->forceFill(['recurrence' => null])->saveQuietly();

        return $copy;
    }

    /** Assignés valides (membres du projet uniquement), le premier reste l'assigné principal. */
    private function assigneeIds(array $data, Project $project): array
    {
        $ids = collect($data['assignee_ids'] ?? [])
            ->when(empty($data['assignee_ids']) && !empty($data['assignee_id']), fn ($c) => $c->push($data['assignee_id']))
            ->map(fn ($id) => (int) $id)->unique()->values();
        $memberIds = $project->members()->pluck('users.id')->push($project->owner_id);

        return $ids->filter(fn ($id) => $memberIds->contains($id))->values()->all();
    }

    private function applyAssignees(Task $task, Project $project, array $data): void
    {
        $task->assignee_id = $this->assigneeIds($data, $project)[0] ?? null;
    }

    public function index(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project) {
            return redirect()->route('projects.index');
        }

        $status   = $request->status;
        $priority = $request->priority;
        $search   = $request->search;
        $view     = $request->view ? $request->view : 'list';

        $query = Task::where('project_id', $project->id)
            ->with(['assignee:id,name', 'assignedUsers:id,name'])
            ->withCount('subtasks');

        if ($request->boolean('mine')) {
            $me = auth()->id();
            $query->where(fn ($q) => $q->where('assignee_id', $me)->orWhereHas('assignedUsers', fn ($a) => $a->where('users.id', $me)));
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        // Ordre utile : échéance la plus proche d'abord, puis priorité.
        $tasks = $query
            ->when($view === 'kanban', fn ($q) => $q->orderByRaw('CASE WHEN position IS NULL THEN 1 ELSE 0 END')->orderBy('position'))
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderByRaw("CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->get();

        return Inertia::render('Tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'status'   => $status,
                'priority' => $priority,
                'search'   => $search,
                'view'     => $view,
                'mine'     => $request->boolean('mine') ? '1' : null,
            ],
            'canEdit' => $project->canEdit(auth()->user()),
            'members' => $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get(),
        ]);
    }

    public function create(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project || !$project->canEdit(auth()->user())) {
            return redirect()->route('projects.index');
        }

        // Membres du projet uniquement comme assignees
        $users = $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get();
        $parentTasks = Task::where('project_id', $project->id)->select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Tasks/Create', [
            'users'       => $users,
            'parentTasks' => $parentTasks,
            'defaults'    => [
                'parent_task_id' => $request->integer('parent') ?: null,
                'status'         => in_array($request->status, ['todo', 'in_progress', 'done']) ? $request->status : 'todo',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'specification'  => 'nullable|string',
            'status'         => 'required|in:todo,in_progress,done,doing,completed',
            'priority'       => 'required|in:low,medium,high,critical',
            'due_date'       => 'nullable|date',
            'assignee_id'    => 'nullable|exists:users,id',
            'assignee_ids'   => 'nullable|array',
            'assignee_ids.*' => 'integer|exists:users,id',
            'parent_task_id' => ['nullable', \Illuminate\Validation\Rule::exists('tasks', 'id')->where('project_id', $project->id)->whereNull('deleted_at')],
            'recurrence'     => 'nullable|in:daily,weekly,monthly',
        ]);

        $task = new Task();
        $task->user_id        = auth()->id();
        $task->project_id     = $project->id;
        $task->title          = $data['title'];
        $task->description    = $data['description'] ?? null;
        $task->specification  = $data['specification'] ?? null;
        $task->status         = $data['status'];
        $task->priority       = $data['priority'];
        $task->due_date       = $data['due_date'] ?? null;
        $task->assignee_id    = $data['assignee_id'] ?? null;
        $task->parent_task_id = $data['parent_task_id'] ?? null;
        $task->recurrence     = $data['recurrence'] ?? null;
        $this->applyAssignees($task, $project, $data);
        $task->position       = (int) Task::where('project_id', $project->id)->where('status', $task->status)->max('position') + 1;
        $task->save();
        $task->assignedUsers()->sync($this->assigneeIds($data, $project));
        \App\Support\Notify::taskAssigned($task, $task->assignedUsers()->pluck('users.id'), auth()->user());

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_created',
            "a créé la tâche : {$task->title}"
        );

        // Ajout rapide (kanban, sous-tâche…) : on reste sur la page d'origine.
        if ($request->boolean('quick')) {
            return back()->with('success', 'Tâche créée.');
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Tâche créée avec succès.');
    }

    public function show(Request $request, Task $task)
    {
        $project = $this->projectFor($task);

        $task->load(['assignee:id,name', 'assignedUsers:id,name', 'user:id,name', 'subtasks', 'parent:id,title', 'attachments', 'comments.user:id,name']);

        foreach ($task->comments as $comment) {
            $comment->can_delete = $comment->user_id == auth()->id();
        }

        return Inertia::render('Tasks/Show', [
            'task'    => $task,
            'canEdit' => $project->canEdit(auth()->user()),
            'members' => $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get(),
        ]);
    }

    public function edit(Request $request, Task $task)
    {
        $project = $this->projectFor($task, true);

        $users = $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get();
        $parentTasks = Task::where('project_id', $project->id)
            ->where('id', '!=', $task->id)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        $task->load('assignedUsers:id');

        return Inertia::render('Tasks/Edit', [
            'task'        => $task,
            'users'       => $users,
            'parentTasks' => $parentTasks,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $project = $this->projectFor($task, true);

        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'specification'  => 'nullable|string',
            'status'         => 'required|in:todo,in_progress,done,doing,completed',
            'priority'       => 'required|in:low,medium,high,critical',
            'due_date'       => 'nullable|date',
            'assignee_id'    => 'nullable|exists:users,id',
            'assignee_ids'   => 'nullable|array',
            'assignee_ids.*' => 'integer|exists:users,id',
            'parent_task_id' => ['nullable', \Illuminate\Validation\Rule::exists('tasks', 'id')->where('project_id', $project->id)->whereNull('deleted_at')],
            'recurrence'     => 'nullable|in:daily,weekly,monthly',
        ]);

        $task->title          = $data['title'];
        $task->description    = $data['description'] ?? null;
        $task->specification  = $data['specification'] ?? null;
        $task->status         = $data['status'];
        $task->priority       = $data['priority'];
        $task->due_date       = $data['due_date'] ?? null;
        $task->assignee_id    = $data['assignee_id'] ?? null;
        $parentId = $data['parent_task_id'] ?? null;
        if ($parentId && ((int) $parentId === $task->id || in_array((int) $parentId, \App\Support\Trash::descendants($task), true))) {
            return back()->withErrors(['parent_task_id' => 'Une tâche ne peut pas être rattachée à elle-même ni à une de ses sous-tâches.']);
        }
        $task->parent_task_id = $parentId;
        $task->recurrence     = $data['recurrence'] ?? null;
        $this->applyAssignees($task, $project, $data);
        $task->save();
        $before = $task->assignedUsers()->pluck('users.id');
        $after = collect($this->assigneeIds($data, $project));
        $task->assignedUsers()->sync($after);
        \App\Support\Notify::taskAssigned($task, $after->diff($before), auth()->user());
        $this->spawnNextOccurrence($task);

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_updated',
            "a mis à jour la tâche : {$task->title}"
        );

        return redirect()->route('tasks.show', $task)->with('success', 'Tâche mise à jour.');
    }

    public function updateStatus(Request $request, Task $task)
    {
        $project = $this->projectFor($task, true, switch: false);

        $data = $request->validate([
            'status' => 'required|in:todo,in_progress,done,completed',
        ]);

        $oldStatus = $task->status;
        $task->status = $data['status'];
        $task->save();
        $next = $this->spawnNextOccurrence($task);

        $statusLabels = [
            'todo'        => 'Pas commencée',
            'in_progress' => 'En cours',
            'done'        => 'Terminée',
            'completed'   => 'Terminée',
        ];

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_status_changed',
            "a passé la tâche \"{$task->title}\" à : " . ($statusLabels[$task->status] ?? $task->status)
        );

        $label = $statusLabels[$task->status] ?? $task->status;

        return back()->with('success', in_array($task->status, ['done', 'completed'])
            ? "« {$task->title} » terminée." . ($next ? ' Prochaine occurrence le ' . \Carbon\Carbon::parse($next->due_date)->translatedFormat('j F') . '.' : '')
            : "« {$task->title} » → {$label}.");
    }

    /** Kanban : nouvel ordre (et statut) d'une colonne après un glisser-déposer. */
    public function reorder(Request $request)
    {
        $project = $this->getActiveProject();
        abort_unless($project && $project->canEdit(auth()->user()), 403);

        $data = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
            'ids'    => 'required|array|max:500',
            'ids.*'  => 'integer',
        ]);

        $tasks = Task::where('project_id', $project->id)->whereIn('id', $data['ids'])->get()->keyBy('id');
        foreach (array_values($data['ids']) as $i => $id) {
            if ($task = $tasks->get($id)) {
                $statusChanged = $task->status !== $data['status'];
                $task->forceFill(['position' => $i + 1, 'status' => $data['status']])->save();
                if ($statusChanged) {
                    $this->spawnNextOccurrence($task);
                }
            }
        }

        return back();
    }

    /** Toutes mes tâches ouvertes, tous projets confondus. */
    public function mine(Request $request)
    {
        $user = auth()->user();
        $projectIds = $user->projects()->pluck('projects.id')->merge($user->ownedProjects()->pluck('id'))->unique();

        $tasks = Task::whereIn('project_id', $projectIds)
            ->whereNotIn('status', ['done', 'completed'])
            ->where(fn ($q) => $q->where('assignee_id', $user->id)
                ->orWhereHas('assignedUsers', fn ($a) => $a->where('users.id', $user->id)))
            ->with(['project:id,name,color', 'assignedUsers:id,name'])
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderByRaw("CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->get(['id', 'title', 'status', 'priority', 'due_date', 'project_id', 'recurrence']);

        return Inertia::render('Tasks/Mine', ['tasks' => $tasks]);
    }

    public function destroy(Request $request, Task $task)
    {
        $project = $this->projectFor($task, true);

        // Corbeille : la tâche et ses sous-tâches partent ensemble (et reviennent ensemble).
        $title = $task->title;
        \App\Support\Trash::deleteTask($task);

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_deleted',
            "a supprimé la tâche : {$title}"
        );

        return redirect()->route('tasks.index')
            ->with('success', "« {$title} » mise à la corbeille.")
            ->with('undo', route('trash.restore', ['task', $task->id]));
    }
}
