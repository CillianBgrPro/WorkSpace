<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/** Déplace les fichiers de projet et pièces jointes du disque public vers le disque privé. */
class PrivatizeFiles extends Command
{
    protected $signature = 'files:privatize';

    protected $description = 'Déplace les fichiers de projets et pièces jointes vers le stockage privé';

    public function handle(): int
    {
        $public = Storage::disk('public');
        $private = Storage::disk('local');
        $moved = 0;

        foreach (['project_files', 'tasks'] as $dir) {
            foreach ($public->allFiles($dir) as $path) {
                if (!$private->exists($path)) {
                    $private->writeStream($path, $public->readStream($path));
                }
                if ($private->size($path) === $public->size($path)) {
                    $public->delete($path);
                    $moved++;
                }
            }
        }

        $this->info("{$moved} fichier(s) déplacé(s) vers le stockage privé.");

        return self::SUCCESS;
    }
}
