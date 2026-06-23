<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('budget_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color')->default('#6366f1');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['budget_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budget_categories');
    }
};
