<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class BackupTest extends TestCase
{
    // Pas de RefreshDatabase : VACUUM INTO est impossible à l'intérieur d'une transaction.

    public function test_backup_creates_archive_and_rotates(): void
    {
        $root = storage_path('app/backups');
        $before = File::isDirectory($root) ? count(File::directories($root)) : 0;

        $this->artisan('backup:run --keep=50')->assertSuccessful();

        $dirs = File::directories($root);
        $this->assertCount($before + 1, $dirs);
        $latest = collect($dirs)->sort()->last();
        $this->assertFileExists($latest . '/files.zip');

        File::deleteDirectory($latest);
    }
}
