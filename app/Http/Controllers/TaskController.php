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
            ->with(['assignee', 'subtasks']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $tasks = $query->get();

        return Inertia::render('Tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'status'   => $status,
                'priority' => $priority,
                'search'   => $search,
                'view'     => $view,
            ],
            'canEdit' => $project->canEdit(auth()->user()),
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
            'status'         => 'required|string',
            'priority'       => 'required|string',
            'due_date'       => 'nullable|date',
            'assignee_id'    => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        $task = new Task();
        $task->user_id        = auth()->id();
        $task->project_id     = $project->id;
        $task->title          = $data['title'];
        $task->description    = $data['description'] ?? null;
        $task->status         = $data['status'];
        $task->priority       = $data['priority'];
        $task->due_date       = $data['due_date'] ?? null;
        $task->assignee_id    = $data['assignee_id'] ?? null;
        $task->parent_task_id = $data['parent_task_id'] ?? null;
        $task->save();

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_created',
            "a créé la tâche : {$task->title}"
        );

        return redirect()->route('tasks.index')->with('success', 'Tâche créée avec succès.');
    }

    public function show(Request $request, Task $task)
    {
        $project = $this->getActiveProject();
        if (!$project || $task->project_id != $project->id) {
            abort(403);
        }

        $task->load(['assignee', 'subtasks', 'parent', 'attachments', 'comments.user']);

        foreach ($task->comments as $comment) {
            $comment->can_delete = $comment->user_id == auth()->id();
        }

        return Inertia::render('Tasks/Show', [
            'task'    => $task,
            'canEdit' => $project->canEdit(auth()->user()),
        ]);
    }

    public function edit(Request $request, Task $task)
    {
        $project = $this->getActiveProject();
        if (!$project || $task->project_id != $project->id || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $users = $project->members()->select('users.id', 'users.name')->orderBy('users.name')->get();
        $parentTasks = Task::where('project_id', $project->id)
            ->where('id', '!=', $task->id)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('Tasks/Edit', [
            'task'        => $task,
            'users'       => $users,
            'parentTasks' => $parentTasks,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $project = $this->getActiveProject();
        if (!$project || $task->project_id != $project->id || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $data = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'status'         => 'required|string',
            'priority'       => 'required|string',
            'due_date'       => 'nullable|date',
            'assignee_id'    => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        $task->title          = $data['title'];
        $task->description    = $data['description'] ?? null;
        $task->status         = $data['status'];
        $task->priority       = $data['priority'];
        $task->due_date       = $data['due_date'] ?? null;
        $task->assignee_id    = $data['assignee_id'] ?? null;
        $task->parent_task_id = $data['parent_task_id'] ?? null;
        $task->save();

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
        $project = $this->getActiveProject();
        if (!$project || $task->project_id != $project->id || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $data = $request->validate([
            'status' => 'required|in:todo,in_progress,done,completed',
        ]);

        $oldStatus = $task->status;
        $task->status = $data['status'];
        $task->save();

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

        return back()->with('success', 'Statut de la tâche mis à jour.');
    }

    public function destroy(Request $request, Task $task)
    {
        $project = $this->getActiveProject();
        if (!$project || $task->project_id != $project->id || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $title = $task->title;
        $task->delete();

        ActivityLog::record(
            $project,
            auth()->user(),
            'task_deleted',
            "a supprimé la tâche : {$title}"
        );

        return redirect()->route('tasks.index')->with('success', 'Tâche supprimée.');
    }
}
