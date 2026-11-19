<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rôles : owner, admin (gère les membres), editor (modifie), viewer (lecture seule).
        Schema::table('project_user', function (Blueprint $table) {
            $table->string('role', 20)->default('editor')->change();
        });
        // Les anciens « member » n'avaient aucun droit d'édition : on leur donne celui prévu.
        DB::table('project_user')->where('role', 'member')->update(['role' => 'editor']);

        Schema::create('project_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');
            $table->string('role', 20)->default('editor');
            $table->string('token', 64)->unique();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['project_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_invitations');
        DB::table('project_user')->whereIn('role', ['editor', 'viewer', 'admin'])->update(['role' => 'member']);
    }
};
