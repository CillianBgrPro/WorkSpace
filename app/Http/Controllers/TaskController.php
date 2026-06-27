<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->status;
        $priority = $request->priority;
        $search = $request->search;
        $view = $request->view ? $request->view : 'list';

        $tasks = Task::where('user_id', auth()->id())->with(['assignee', 'subtasks'])->get();

        // filtrer par status
        if ($status) {
            $tasks = Task::where('user_id', auth()->id())->where('status', $status)->with(['assignee', 'subtasks'])->get();
        }

        // filtrer par priorité
        if ($priority) {
            $tasks = Task::where('user_id', auth()->id())->where('priority', $priority)->with(['assignee', 'subtasks'])->get();
        }

        // les 2 filtres en meme temps
        if ($status && $priority) {
            $tasks = Task::where('user_id', auth()->id())
                ->where('status', $status)
                ->where('priority', $priority)
                ->with(['assignee', 'subtasks'])
                ->get();
        }

        // recherche par titre
        if ($search) {
            $tasks = Task::where('user_id', auth()->id())
                ->where('title', 'like', '%' . $search . '%')
                ->with(['assignee', 'subtasks'])
                ->get();
        }

        return Inertia::render('Tasks/index', [
            'tasks' => $tasks,
            'filters' => [
                'status' => $status,
                'priority' => $priority,
                'search' => $search,
                'view' => $view,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $users = User::select('id', 'name')->orderBy('name')->get();
        $parentTasks = Task::where('user_id', auth()->id())->select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Tasks/Create', [
            'users' => $users,
            'parentTasks' => $parentTasks,
        ]);
    }

    public function store(Request $request)
    {
        // validation des données
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'due_date' => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        $task = new Task();
        $task->user_id = auth()->id();
        $task->title = $data['title'];
        $task->description = $data['description'] ?? null;
        $task->status = $data['status'];
        $task->priority = $data['priority'];
        $task->due_date = $data['due_date'] ?? null;
        $task->assignee_id = $data['assignee_id'] ?? null;
        $task->parent_task_id = $data['parent_task_id'] ?? null;
        $task->save();

        return redirect()->route('tasks.index')->with('success', 'Tache creee avec succes.');
    }

    public function show(Request $request, Task $task)
    {
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $task->load(['assignee', 'subtasks', 'parent', 'attachments', 'comments.user']);

        // check si l'user peut supprimer les commentaires
        foreach ($task->comments as $comment) {
            $comment->can_delete = $comment->user_id == auth()->id();
        }

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Request $request, Task $task)
    {
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $users = User::select('id', 'name')->orderBy('name')->get();
        $parentTasks = Task::where('user_id', auth()->id())->where('id', '!=', $task->id)->select('id', 'title')->orderBy('title')->get();

        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'users' => $users,
            'parentTasks' => $parentTasks,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'due_date' => 'nullable|date',
            'assignee_id' => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
        ]);

        $task->title = $data['title'];
        $task->description = $data['description'] ?? null;
        $task->status = $data['status'];
        $task->priority = $data['priority'];
        $task->due_date = $data['due_date'] ?? null;
        $task->assignee_id = $data['assignee_id'] ?? null;
        $task->parent_task_id = $data['parent_task_id'] ?? null;
        $task->save();

        return redirect()->route('tasks.show', $task)->with('success', 'Tache mise a jour.');
    }

    public function destroy(Request $request, Task $task)
    {
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Tache supprimee.');
    }
}
