<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $priority = $request->string('priority')->toString();
        $search = $request->string('search')->toString();
        $view = $request->string('view')->toString() ?: 'list';

        $tasks = Task::query()
            ->where('user_id', $request->user()->id)
            ->with(['assignee:id,name', 'subtasks'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($priority, fn ($query) => $query->where('priority', $priority))
            ->when($search, fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->orderByRaw("
                CASE priority
                    WHEN 'critical' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END
            ")
            ->latest()
            ->get();

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

    public function create(Request $request): Response
    {
        return Inertia::render('Tasks/Create', [
            'users' => User::select('id', 'name')->orderBy('name')->get(),
            'parentTasks' => Task::where('user_id', $request->user()->id)
                ->select('id', 'title')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        Task::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('tasks.index')->with('success', 'Tache creee avec succes.');
    }

    public function show(Request $request, Task $task): Response
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->load(['assignee:id,name', 'subtasks.assignee:id,name', 'parent:id,title']);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Request $request, Task $task): Response
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'users' => User::select('id', 'name')->orderBy('name')->get(),
            'parentTasks' => Task::where('user_id', $request->user()->id)
                ->where('id', '!=', $task->id)
                ->select('id', 'title')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->update($request->validated());

        return redirect()->route('tasks.show', $task)->with('success', 'Tache mise a jour.');
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Tache supprimee.');
    }
}
