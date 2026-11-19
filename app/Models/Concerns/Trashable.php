<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;

/** Suppression douce + mémorisation de l'auteur de la suppression. */
trait Trashable
{
    use SoftDeletes;

    public const TRASH_DAYS = 30;

    public static function bootTrashable(): void
    {
        static::softDeleted(function ($model) {
            if (auth()->check() && $model->deleted_by === null) {
                $model->forceFill(['deleted_by' => auth()->id()])->saveQuietly();
            }
        });
        static::restoring(fn ($model) => $model->deleted_by = null);
    }

    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }
}
