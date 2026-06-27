<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function store(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'notes' => 'nullable|string',
        ]);

        $expense = new Expense();
        $expense->budget_id = $budget->id;
        $expense->description = $data['description'];
        $expense->amount = $data['amount'];
        $expense->date = $data['date'];
        $expense->budget_category_id = $data['budget_category_id'] ?? null;
        $expense->notes = $data['notes'] ?? null;
        $expense->save();

        return back()->with('success', 'Dépense ajoutée.');
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->budget->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'budget_category_id' => 'nullable|exists:budget_categories,id',
            'notes' => 'nullable|string',
        ]);

        $expense->description = $data['description'];
        $expense->amount = $data['amount'];
        $expense->date = $data['date'];
        $expense->budget_category_id = $data['budget_category_id'] ?? null;
        $expense->notes = $data['notes'] ?? null;
        $expense->save();

        return back()->with('success', 'Dépense mise à jour.');
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->budget->user_id != auth()->id()) {
            abort(403);
        }

        $expense->delete();

        return back()->with('success', 'Dépense supprimée.');
    }
}
