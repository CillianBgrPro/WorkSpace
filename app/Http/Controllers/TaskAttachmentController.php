<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskAttachmentController extends Controller
{
    public function store(Request $request, Task $task): RedirectResponse
    {
        abort_unless($task->user_id === $request->user()->id, 403);

        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,pdf', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store("tasks/{$task->id}", 'public');

        $task->attachments()->create([
            'user_id' => $request->user()->id,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        return redirect()
            ->route('tasks.show', $task)
            ->with('success', 'Fichier ajoute avec succes.');
    }

    public function destroy(Request $request, TaskAttachment $attachment): RedirectResponse
    {
        abort_unless($attachment->task->user_id === $request->user()->id, 403);

        $task = $attachment->task;
        $attachment->delete();

        return redirect()
            ->route('tasks.show', $task)
            ->with('success', 'Fichier supprime.');
    }
}
