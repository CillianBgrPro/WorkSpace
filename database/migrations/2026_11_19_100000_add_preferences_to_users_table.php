<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // false pour les comptes créés via Google (mot de passe aléatoire inconnu)
            $table->boolean('has_password')->default(true)->after('password');
            $table->string('theme', 10)->default('system')->after('avatar');
            $table->boolean('email_notifications')->default(true)->after('theme');
            $table->string('calendar_token', 64)->nullable()->unique()->after('email_notifications');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['calendar_token']);
            $table->dropColumn(['has_password', 'theme', 'email_notifications', 'calendar_token']);
        });
    }
};
