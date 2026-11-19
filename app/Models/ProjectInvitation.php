<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProjectInvitation extends Model
{
    protected $fillable = ['project_id', 'invited_by', 'email', 'role', 'token', 'accepted_at', 'expires_at'];

    protected $hidden = ['token'];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at'  => 'datetime',
    ];

    public const DAYS_VALID = 14;

    public static function issue(Project $project, User $by, string $email, string $role): self
    {
        // Une seule invitation en attente par adresse : on renouvelle l'existante.
        $invitation = static::firstOrNew([
            'project_id'  => $project->id,
            'email'       => strtolower($email),
            'accepted_at' => null,
        ]);
        $invitation->fill([
            'invited_by' => $by->id,
            'role'       => $role,
            'token'      => Str::random(48),
            'expires_at' => now()->addDays(self::DAYS_VALID),
        ])->save();

        return $invitation;
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null && $this->expires_at->isFuture();
    }

    /**
     * Ajoute l'utilisateur au projet et clôt l'invitation.
     * Déjà membre : l'invitation reste valable pour la personne à qui elle était destinée.
     */
    public function acceptFor(User $user): bool
    {
        if ($this->project->isMember($user)) {
            return false;
        }
        $this->project->members()->attach($user->id, ['role' => $this->role]);
        $this->forceFill(['accepted_at' => now()])->save();

        return true;
    }
}
