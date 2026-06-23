<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function store(StoreExpenseRequest $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        Expense::create($request->validated());

        return back()->with('success', 'Dépense ajoutée.');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        abort_unless($expense->budget->user_id === $request->user()->id, 403);

        $expense->update($request->validated());

        return back()->with('success', 'Dépense mise à jour.');
    }

    public function destroy(Request $request, Expense $expense)
    {
        abort_unless($expense->budget->user_id === $request->user()->id, 403);

        $expense->delete();

        return back()->with('success', 'Dépense supprimée.');
    }
}
