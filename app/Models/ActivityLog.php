<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'user_id',
        'action',
        'description',
        'properties',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper pour enregistrer une activité rapidement.
     */
    public static function record(?Project $project, ?User $user, string $action, string $description, ?array $properties = null): ?self
    {
        if (!$project) {
            return null;
        }

        return self::create([
            'project_id'  => $project->id,
            'user_id'     => $user ? $user->id : auth()->id(),
            'action'      => $action,
            'description' => $description,
            'properties'  => $properties,
        ]);
    }
}
