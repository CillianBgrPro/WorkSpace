<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->hasMany(BudgetCategory::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    // calcule le total des dépenses du budget
    public function getTotalExpensesAttribute()
    {
        return $this->expenses()->sum('amount') ?? 0;
    }

    // ce qui reste apres les depenses
    public function getRemainingBudgetAttribute()
    {
        $total = $this->amount - $this->total_expenses;
        return $total;
    }

    public function getPercentageConsumedAttribute()
    {
        if ($this->amount > 0) {
            return ($this->total_expenses / $this->amount) * 100;
        }
        return 0;
    }

    public function isAlertTriggered()
    {
        return $this->percentage_consumed >= $this->alert_threshold_percentage;
    }
}
