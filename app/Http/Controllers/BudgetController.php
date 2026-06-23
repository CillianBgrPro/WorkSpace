<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $budgets = Budget::where('user_id', $request->user()->id)
            ->with(['categories', 'expenses'])
            ->orderBy('start_date', 'desc')
            ->get()
            ->map(fn($budget) => [
                'id' => $budget->id,
                'name' => $budget->name,
                'description' => $budget->description,
                'amount' => (float) $budget->amount,
                'total_expenses' => (float) $budget->total_expenses,
                'remaining_budget' => (float) $budget->remaining_budget,
                'percentage_consumed' => (float) $budget->percentage_consumed,
                'is_alert_triggered' => $budget->isAlertTriggered(),
                'alert_threshold' => (float) $budget->alert_threshold_percentage,
                'status' => $budget->status,
                'start_date' => $budget->start_date->format('Y-m-d'),
                'end_date' => $budget->end_date?->format('Y-m-d'),
            ]);

        return Inertia::render('Budget/Index', [
            'budgets' => $budgets,
        ]);
    }

    public function create()
    {
        return Inertia::render('Budget/Create');
    }

    public function store(StoreBudgetRequest $request)
    {
        Budget::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('budgets.index')->with('success', 'Budget créé avec succès.');
    }

    public function show(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->load(['categories', 'expenses' => fn($q) => $q->latest()]);

        return Inertia::render('Budget/Show', [
            'budget' => [
                'id' => $budget->id,
                'name' => $budget->name,
                'description' => $budget->description,
                'amount' => (float) $budget->amount,
                'total_expenses' => (float) $budget->total_expenses,
                'remaining_budget' => (float) $budget->remaining_budget,
                'percentage_consumed' => (float) $budget->percentage_consumed,
                'is_alert_triggered' => $budget->isAlertTriggered(),
                'alert_threshold' => (float) $budget->alert_threshold_percentage,
                'status' => $budget->status,
                'start_date' => $budget->start_date->format('Y-m-d'),
                'end_date' => $budget->end_date?->format('Y-m-d'),
                'categories' => $budget->categories->map(fn($cat) => [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'color' => $cat->color,
                    'total_expenses' => (float) $cat->total_expenses,
                ]),
                'expenses' => $budget->expenses->map(fn($exp) => [
                    'id' => $exp->id,
                    'description' => $exp->description,
                    'amount' => (float) $exp->amount,
                    'date' => $exp->date->format('Y-m-d'),
                    'category' => $exp->category ? $exp->category->name : 'Sans catégorie',
                    'category_color' => $exp->category ? $exp->category->color : '#cbd5e1',
                    'notes' => $exp->notes,
                    'receipt_url' => $exp->receipt_url,
                ]),
            ],
        ]);
    }

    public function edit(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        return Inertia::render('Budget/Edit', [
            'budget' => $budget,
        ]);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->update($request->validated());

        return redirect()->route('budgets.show', $budget)->with('success', 'Budget mis à jour.');
    }

    public function destroy(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $budget->delete();

        return redirect()->route('budgets.index')->with('success', 'Budget supprimé.');
    }
}
