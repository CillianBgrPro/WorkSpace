<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'status',
        'owner_id',
    ];

    /**
     * Le propriétaire du projet.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Tous les membres du projet (via la table pivot project_user).
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Les tâches associées à ce projet.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Les budgets associés à ce projet.
     */
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Les événements associés à ce projet.
     */
    public function events()
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Les équipes associées à ce projet.
     */
    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Le journal d'activité du projet.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Les fichiers téléversés dans ce projet.
     */
    public function files()
    {
        return $this->hasMany(ProjectFile::class);
    }

    /**
     * Vérifie si l'utilisateur est propriétaire.
     */
    public function isOwner(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    /**
     * Obtenir le rôle d'un membre dans le projet.
     */
    public function getMemberRole(User $user): ?string
    {
        if ($this->owner_id === $user->id) {
            return 'owner';
        }
        $member = $this->members()->where('user_id', $user->id)->first();
        return $member ? ($member->pivot->role ?? 'editor') : null;
    }

    /**
     * Vérifie si l'utilisateur a au moins des droits d'édition.
     */
    public function canEdit(User $user): bool
    {
        $role = $this->getMemberRole($user);
        return in_array($role, ['owner', 'admin', 'editor']);
    }

    /**
     * Vérifie si l'utilisateur est admin ou owner.
     */
    public function isAdmin(User $user): bool
    {
        $role = $this->getMemberRole($user);
        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Vérifie si l'utilisateur est membre ou propriétaire.
     */
    public function isMember(User $user): bool
    {
        if ($this->owner_id === $user->id) {
            return true;
        }
        return $this->members()->where('user_id', $user->id)->exists();
    }
}
