<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (! Schema::hasColumn('tasks', 'specification')) {
                $table->longText('specification')->nullable()->after('description');
            }

            if (! Schema::hasColumn('tasks', 'assignee_id')) {
                $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('tasks', 'parent_task_id')) {
                $table->foreignId('parent_task_id')->nullable()->constrained('tasks')->cascadeOnDelete();
            }
        });

        // Postgres n'a pas FIELD(), et les anciennes migrations peuvent garder
        // une contrainte de priorite sans "critical".
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check");
            DB::statement(
                "ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'critical'))"
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'parent_task_id')) {
                $table->dropConstrainedForeignId('parent_task_id');
            }

            if (Schema::hasColumn('tasks', 'assignee_id')) {
                $table->dropConstrainedForeignId('assignee_id');
            }

            if (Schema::hasColumn('tasks', 'specification')) {
                $table->dropColumn('specification');
            }
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check");
            DB::statement(
                "ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high'))"
            );
        }
    }
};
