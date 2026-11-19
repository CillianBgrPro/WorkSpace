<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /** Valeurs par défaut, alignées sur la base (utile avant tout rechargement du modèle). */
    protected $attributes = [
        'has_password'        => true,
        'theme'               => 'system',
        'email_notifications' => true,
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
        'calendar_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'has_password' => 'boolean',
            'email_notifications' => 'boolean',
        ];
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_user');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class)->withPivot('role')->withTimestamps();
    }

    public function ownedTeams()
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function assignedTasks()
    {
        return $this->belongsToMany(Task::class)->withTimestamps();
    }

    /**
     * Projets dont l'utilisateur est membre (via pivot project_user).
     */
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Projets dont l'utilisateur est propriétaire.
     */
    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }
}
