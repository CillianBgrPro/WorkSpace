<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function store(Request $request, Budget $budget)
    {
        $user = auth()->user();
        if (!$budget->project || !$budget->project->canEdit($user)) {
            abort(403, "Vous n'avez pas les permissions pour ajouter une dépense dans ce projet.");
        }

        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0',
            'date'        => 'required|date',
            'category_id' => 'required|exists:budget_categories,id',
            'notes'       => 'nullable|string',
        ]);

        $expense = new Expense();
        $expense->budget_id   = $budget->id;
        $expense->description = $data['description'];
        $expense->amount      = $data['amount'];
        $expense->date        = $data['date'];
        $expense->category_id = $data['category_id'];
        $expense->notes       = $data['notes'] ?? null;
        $expense->save();

        ActivityLog::record(
            $budget->project,
            $user,
            'expense_created',
            "a ajouté une dépense de {$expense->amount} € : {$expense->description}"
        );

        return back()->with('success', 'Dépense ajoutée.');
    }

    public function update(Request $request, Expense $expense)
    {
        $user = auth()->user();
        $project = $expense->budget->project ?? null;
        if (!$project || !$project->canEdit($user)) {
            abort(403, "Vous n'avez pas les permissions pour modifier cette dépense.");
        }

        $data = $request->validate([
            'description' => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0',
            'date'        => 'required|date',
            'category_id' => 'required|exists:budget_categories,id',
            'notes'       => 'nullable|string',
        ]);

        $expense->description = $data['description'];
        $expense->amount      = $data['amount'];
        $expense->date        = $data['date'];
        $expense->category_id = $data['category_id'];
        $expense->notes       = $data['notes'] ?? null;
        $expense->save();

        ActivityLog::record(
            $project,
            $user,
            'expense_updated',
            "a modifié la dépense : {$expense->description}"
        );

        return back()->with('success', 'Dépense mise à jour.');
    }

    public function destroy(Request $request, Expense $expense)
    {
        $user = auth()->user();
        $project = $expense->budget->project ?? null;
        if (!$project || !$project->canEdit($user)) {
            abort(403, "Vous n'avez pas les permissions pour supprimer cette dépense.");
        }

        $desc = $expense->description;
        $expense->delete();

        ActivityLog::record(
            $project,
            $user,
            'expense_deleted',
            "a supprimé la dépense : {$desc}"
        );

        return back()->with('success', 'Dépense supprimée.');
    }
}
