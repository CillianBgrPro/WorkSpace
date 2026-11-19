<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Évite d'envoyer deux fois le même rappel.
        Schema::table('events', function (Blueprint $table) {
            $table->timestamp('reminder_sent_at')->nullable();
        });
        Schema::table('tasks', function (Blueprint $table) {
            $table->date('due_reminder_sent_on')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('events', fn (Blueprint $t) => $t->dropColumn('reminder_sent_at'));
        Schema::table('tasks', fn (Blueprint $t) => $t->dropColumn('due_reminder_sent_on'));
    }
};
