<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'amount',
        'alert_threshold_percentage',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'alert_threshold_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(BudgetCategory::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function getTotalExpensesAttribute(): float
    {
        return $this->expenses()->sum('amount') ?? 0;
    }

    public function getRemainingBudgetAttribute(): float
    {
        return $this->amount - $this->total_expenses;
    }

    public function getPercentageConsumedAttribute(): float
    {
        return $this->amount > 0 ? ($this->total_expenses / $this->amount) * 100 : 0;
    }

    public function isAlertTriggered(): bool
    {
        return $this->percentage_consumed >= $this->alert_threshold_percentage;
    }
}
