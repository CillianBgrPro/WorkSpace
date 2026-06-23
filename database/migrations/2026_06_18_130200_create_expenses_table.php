<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('budget_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('budget_categories')->cascadeOnDelete();
            $table->string('description');
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('receipt_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['budget_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
