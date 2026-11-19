<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    /** Projet de la tâche, si l'utilisateur en est membre. */
    private function projectFor(Task $task): Project
    {
        $project = $task->project;
        abort_unless($project && $project->isMember(auth()->user()), 403);

        return $project;
    }

    public function store(Request $request, Task $task)
    {
        // Tout éditeur du projet peut joindre un fichier (pas seulement le créateur de la tâche).
        abort_unless($this->projectFor($task)->canEdit(auth()->user()), 403);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('tasks/' . $task->id, 'local');

        $attachment = new TaskAttachment();
        $attachment->task_id = $task->id;
        $attachment->user_id = auth()->id();
        $attachment->path = $path;
        $attachment->original_name = $file->getClientOriginalName();
        $attachment->mime_type = $file->getMimeType();
        $attachment->size = $file->getSize();
        $attachment->save();

        return redirect()->route('tasks.show', $task)->with('success', 'Fichier ajouté.');
    }

    /** Aperçu (formats sûrs) ou téléchargement avec ?download=1. */
    public function show(Request $request, TaskAttachment $attachment)
    {
        $this->projectFor($attachment->task);

        $disk = Storage::disk($attachment->storageDisk());
        abort_unless($disk->exists($attachment->path), 404);

        if ($request->boolean('download') || !ProjectFileController::previewContentType($attachment->original_name)) {
            return $disk->download($attachment->path, $attachment->original_name);
        }

        return ProjectFileController::inlineResponse($disk->path($attachment->path), $attachment->original_name);
    }

    public function destroy(Request $request, TaskAttachment $attachment)
    {
        $task = $attachment->task;
        $project = $this->projectFor($task);
        abort_unless($project->canEdit(auth()->user()) || $attachment->user_id === auth()->id(), 403);

        $attachment->delete();

        return redirect()->route('tasks.show', $task)->with('success', 'Fichier supprimé.');
    }
}
