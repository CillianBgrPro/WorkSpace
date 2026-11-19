<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        // Tout membre du projet peut commenter (lecteurs compris).
        abort_unless($task->project && $task->project->isMember(auth()->user()), 403);

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $comment = new TaskComment();
        $comment->task_id = $task->id;
        $comment->user_id = auth()->id();
        $comment->body = $request->body;
        $comment->save();

        \App\Support\Notify::commentAdded($comment, auth()->user());

        return redirect()->route('tasks.show', $task)->with('success', 'Commentaire ajouté.');
    }

    public function destroy(Request $request, TaskComment $comment)
    {
        // L'auteur du commentaire, ou un administrateur du projet.
        $project = $comment->task->project;
        abort_unless($comment->user_id === auth()->id() || ($project && $project->isAdmin(auth()->user())), 403);

        $comment->delete();

        return redirect()->route('tasks.show', $comment->task)->with('success', 'Commentaire supprimé.');
    }
}