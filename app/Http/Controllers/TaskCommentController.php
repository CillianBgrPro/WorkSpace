<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        // Autorisation
        abort_unless($task->user_id === $request->user()->id, 403);

        // Validation
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        // Création du commentaire
        $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        // Redirection
        return redirect()
            ->route('tasks.show', $task)
            ->with('success', 'Commentaire ajouté.');
    }

    public function destroy(Request $request, TaskComment $comment): RedirectResponse
    {
        abort_unless($comment->task->user_id === $request->user()->id, 403);

        $comment->delete();

        return redirect()
            ->route('tasks.show', $comment->task)
            ->with('success', 'Commentaire supprimé.');
    }
}