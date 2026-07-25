<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectFileController extends Controller
{
    private function getActiveProject(): ?Project
    {
        $projectId = session('active_project_id');
        if (!$projectId) return null;
        $project = Project::find($projectId);
        if (!$project || !$project->isMember(auth()->user())) return null;
        return $project;
    }

    public function index(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project) {
            return redirect()->route('projects.index');
        }

        $files = ProjectFile::where('project_id', $project->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Projects/Files', [
            'files'   => $files,
            'canEdit' => $project->canEdit(auth()->user()),
        ]);
    }

    public function store(Request $request)
    {
        $project = $this->getActiveProject();
        if (!$project || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // Max 10Mo
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('project_files/' . $project->id, 'public');

        $file = ProjectFile::create([
            'project_id' => $project->id,
            'user_id'    => auth()->id(),
            'name'       => $uploadedFile->getClientOriginalName(),
            'file_path'  => $path,
            'mime_type'  => $uploadedFile->getClientMimeType(),
            'size'       => $uploadedFile->getSize(),
        ]);

        ActivityLog::record(
            $project,
            auth()->user(),
            'file_uploaded',
            "a ajouté le fichier : {$file->name}"
        );

        return back()->with('success', 'Fichier téléversé avec succès.');
    }

    public function download(ProjectFile $file)
    {
        $project = $this->getActiveProject();
        if (!$project || $file->project_id != $project->id) {
            abort(403);
        }

        if (!Storage::disk('public')->exists($file->file_path)) {
            abort(444, 'Fichier introuvable sur le serveur.');
        }

        return Storage::disk('public')->download($file->file_path, $file->name);
    }

    public function destroy(ProjectFile $file)
    {
        $project = $this->getActiveProject();
        if (!$project || $file->project_id != $project->id || !$project->canEdit(auth()->user())) {
            abort(403);
        }

        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        $fileName = $file->name;
        $file->delete();

        ActivityLog::record(
            $project,
            auth()->user(),
            'file_deleted',
            "a supprimé le fichier : {$fileName}"
        );

        return back()->with('success', 'Fichier supprimé.');
    }
}
