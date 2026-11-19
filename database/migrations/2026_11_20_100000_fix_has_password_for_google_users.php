<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * La colonne has_password a été ajoutée avec « true » par défaut, y compris pour les comptes
     * créés via Google, dont le mot de passe aléatoire est inconnu de leur propriétaire.
     */
    public function up(): void
    {
        DB::table('users')->whereNotNull('google_id')->update(['has_password' => false]);
    }

    public function down(): void
    {
    }
};
