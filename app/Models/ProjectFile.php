<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectFile extends Model
{
    use HasFactory, \App\Models\Concerns\Trashable;

    protected $fillable = [
        'project_id',
        'user_id',
        'name',
        'file_path',
        'mime_type',
        'size',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Disque où se trouve le fichier : privé désormais, public pour les fichiers d'avant la migration. */
    public function storageDisk(): string
    {
        return \Illuminate\Support\Facades\Storage::disk('local')->exists($this->file_path) ? 'local' : 'public';
    }

    protected static function booted(): void
    {
        // Le fichier physique n'est effacé qu'à la suppression définitive (vidage de la corbeille).
        static::forceDeleting(function (ProjectFile $file) {
            \Illuminate\Support\Facades\Storage::disk($file->storageDisk())->delete($file->file_path);
        });
    }
}
