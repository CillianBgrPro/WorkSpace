<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\HeaderUtils;
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
            abort(404, 'Fichier introuvable sur le serveur.');
        }

        return Storage::disk('public')->download($file->file_path, $file->name);
    }

    /**
     * Aperçu dans le navigateur, réservé aux formats sans risque.
     * Le texte et le code sont toujours servis en text/plain (jamais interprétés),
     * les SVG dans un bac à sable CSP : un fichier envoyé ne peut pas exécuter de script.
     */
    public function preview(ProjectFile $file)
    {
        $project = $this->getActiveProject();
        if (!$project || $file->project_id != $project->id) {
            abort(403);
        }

        $disk = Storage::disk('public');
        if (!$disk->exists($file->file_path)) {
            abort(404, 'Fichier introuvable sur le serveur.');
        }

        $type = self::previewContentType($file->name);
        if (!$type) {
            abort(415, 'Aperçu indisponible pour ce format.');
        }

        $safeName = str_replace(['/', '\\'], '-', $file->name);
        $headers = [
            'Content-Type'           => $type,
            // Gère les noms accentués (filename*=UTF-8'') avec un repli ASCII.
            'Content-Disposition'    => HeaderUtils::makeDisposition('inline', $safeName, Str::ascii(str_replace('%', '-', $safeName)) ?: 'fichier'),
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control'          => 'private, max-age=600',
        ];
        if (str_starts_with($type, 'image/svg')) {
            $headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
        }

        return response()->file($disk->path($file->file_path), $headers);
    }

    /** Type MIME à utiliser pour l'aperçu, ou null si le format n'est pas prévisualisable. */
    public static function previewContentType(string $name): ?string
    {
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

        $types = [
            'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'gif' => 'image/gif',
            'webp' => 'image/webp', 'avif' => 'image/avif', 'bmp' => 'image/bmp', 'svg' => 'image/svg+xml',
            'pdf' => 'application/pdf',
            'mp4' => 'video/mp4', 'webm' => 'video/webm', 'mov' => 'video/quicktime', 'ogv' => 'video/ogg',
            'mp3' => 'audio/mpeg', 'wav' => 'audio/wav', 'ogg' => 'audio/ogg', 'm4a' => 'audio/mp4',
        ];
        if (isset($types[$ext])) {
            return $types[$ext];
        }

        $text = ['txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'xml', 'yml', 'yaml', 'log', 'ini', 'env',
            'js', 'jsx', 'ts', 'tsx', 'php', 'py', 'rb', 'java', 'c', 'h', 'cpp', 'cs', 'go', 'rs', 'swift', 'kt',
            'sql', 'sh', 'css', 'scss', 'html', 'htm', 'vue', 'svelte'];

        return in_array($ext, $text, true) ? 'text/plain; charset=utf-8' : null;
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
