<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;

class TaskAttachmentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        if ($task->user_id != auth()->id()) {
            abort(403);
        }

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('tasks/' . $task->id, 'public');

        $attachment = new TaskAttachment();
        $attachment->task_id = $task->id;
        $attachment->user_id = auth()->id();
        $attachment->path = $path;
        $attachment->original_name = $file->getClientOriginalName();
        $attachment->mime_type = $file->getMimeType();
        $attachment->size = $file->getSize();
        $attachment->save();

        return redirect()->route('tasks.show', $task)->with('success', 'Fichier ajoute avec succes.');
    }

    public function destroy(Request $request, TaskAttachment $attachment)
    {
        // verif que l'user est proprio de la tache liee
        if ($attachment->task->user_id != auth()->id()) {
            abort(403);
        }

        $task = $attachment->task;
        $attachment->delete();

        return redirect()->route('tasks.show', $task)->with('success', 'Fichier supprime.');
    }
}
