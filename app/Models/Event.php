<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use \App\Models\Concerns\Trashable;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'description',
        'type',
        'color',
        'start_at',
        'end_at',
        'all_day',
        'reminder',
        'reminder_minutes',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'all_day' => 'boolean',
        'reminder' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_user');
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class)->withTimestamps();
    }
}
