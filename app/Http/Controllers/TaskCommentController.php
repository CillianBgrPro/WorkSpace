<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        // verif que la tache appartient bien a l'user connecté
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $comment = new TaskComment();
        $comment->task_id = $task->id;
        $comment->user_id = auth()->id();
        $comment->body = $request->body;
        $comment->save();

        return redirect()->route('tasks.show', $task)->with('success', 'Commentaire ajouté.');
    }

    public function destroy(Request $request, TaskComment $comment)
    {
        // on verifie que c'est bien le proprio de la tache
        if ($comment->task->user_id != auth()->id()) {
            abort(403);
        }

        $comment->delete();

        return redirect()->route('tasks.show', $comment->task)->with('success', 'Commentaire supprimé.');
    }
}