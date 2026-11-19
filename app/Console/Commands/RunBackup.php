<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use ZipArchive;

/**
 * Sauvegarde quotidienne : instantané cohérent de la base + archive des fichiers privés.
 * Conservées dans storage/app/backups (hors web) avec rotation.
 * Si BACKUP_COPY_COMMAND est défini (ex. une commande rclone), il est exécuté ensuite pour
 * copier la sauvegarde hors du serveur ; {dir} y est remplacé par le dossier créé.
 */
class RunBackup extends Command
{
    protected $signature = 'backup:run {--keep=14 : Nombre de sauvegardes conservées}';

    protected $description = 'Sauvegarde la base de données et les fichiers';

    public function handle(): int
    {
        $root = storage_path('app/backups');
        $dir = $root . '/' . now()->format('Y-m-d_His');
        File::ensureDirectoryExists($dir, 0750);

        // 1. Base : VACUUM INTO produit une copie cohérente même pendant l'utilisation.
        if (DB::getDriverName() === 'sqlite') {
            $target = $dir . '/database.sqlite';
            DB::statement('VACUUM INTO ' . DB::getPdo()->quote($target));
            $this->line('Base : ' . $this->size($target));
        } else {
            $this->warn('Base non SQLite : utilisez l\'outil de dump du serveur de base de données.');
        }

        // 2. Fichiers privés (projets et pièces jointes).
        $zipPath = $dir . '/files.zip';
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE);
        $base = storage_path('app/private');
        $count = 0;
        foreach (File::allFiles($base) as $file) {
            if (str_starts_with($file->getRelativePathname(), 'backups')) {
                continue;
            }
            $zip->addFile($file->getPathname(), $file->getRelativePathname());
            $count++;
        }
        // Manifeste toujours présent : l'archive existe même sans fichier (ZipArchive n'écrit pas d'archive vide).
        $zip->addFromString('MANIFEST.txt', implode("\n", [
            'Sauvegarde WorkSpace',
            'Date : ' . now()->format('d/m/Y H:i:s'),
            "Fichiers : {$count}",
            // safe.directory : le dépôt appartient à root alors que la sauvegarde tourne sous www-data.
            'Version : ' . trim((string) @shell_exec('git -c safe.directory=' . escapeshellarg(base_path()) . ' -C ' . escapeshellarg(base_path()) . ' log --oneline -1 2>/dev/null')),
        ]) . "\n");
        $zip->close();
        $this->line("Fichiers : {$count} (" . $this->size($zipPath) . ')');

        // 3. Rotation.
        $all = collect(File::directories($root))->sort()->values();
        $old = $all->slice(0, max(0, $all->count() - (int) $this->option('keep')));
        $old->each(fn ($d) => File::deleteDirectory($d));

        // 4. Copie externe optionnelle.
        if ($cmd = env('BACKUP_COPY_COMMAND')) {
            $result = \Illuminate\Support\Facades\Process::timeout(600)->run(str_replace('{dir}', escapeshellarg($dir), $cmd));
            if ($result->failed()) {
                $this->error('Copie externe échouée : ' . trim($result->errorOutput()));
                report(new \RuntimeException('Copie externe de la sauvegarde échouée : ' . trim($result->errorOutput())));

                return self::FAILURE;
            }
            $this->line('Copie externe : OK');
        }

        $this->info("Sauvegarde créée : {$dir} ({$old->count()} ancienne(s) supprimée(s))");

        return self::SUCCESS;
    }

    private function size(string $path): string
    {
        $bytes = filesize($path);

        return $bytes > 1048576 ? round($bytes / 1048576, 1) . ' Mo' : round($bytes / 1024) . ' Ko';
    }
}
