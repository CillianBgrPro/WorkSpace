<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $budgets = Budget::where('user_id', auth()->id())
            ->with(['categories', 'expenses'])
            ->orderBy('start_date', 'desc')
            ->get();

        $result = [];
        foreach ($budgets as $budget) {
            $result[] = [
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
                'end_date' => $budget->end_date ? $budget->end_date->format('Y-m-d') : null,
            ];
        }

        return Inertia::render('Budget/Index', [
            'budgets' => $result,
        ]);
    }

    public function create()
    {
        return Inertia::render('Budget/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'alert_threshold_percentage' => 'nullable|numeric',
            'status' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
        ]);

        $budget = new Budget();
        $budget->user_id = auth()->id();
        $budget->name = $data['name'];
        $budget->description = $data['description'] ?? null;
        $budget->amount = $data['amount'];
        $budget->alert_threshold_percentage = $data['alert_threshold_percentage'] ?? 80;
        $budget->status = $data['status'];
        $budget->start_date = $data['start_date'];
        $budget->end_date = $data['end_date'] ?? null;
        $budget->save();

        return redirect()->route('budgets.index')->with('success', 'Budget créé avec succès.');
    }

    public function show(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $budget->load(['categories', 'expenses']);

        // trie les expenses du plus recent
        $expenses_list = $budget->expenses->sortByDesc('created_at');

        $categories_list = [];
        foreach ($budget->categories as $cat) {
            $categories_list[] = [
                'id' => $cat->id,
                'name' => $cat->name,
                'color' => $cat->color,
                'total_expenses' => (float) $cat->total_expenses,
            ];
        }

        $expenses_data = [];
        foreach ($expenses_list as $exp) {
            $cat_name = 'Sans catégorie';
            $cat_color = '#cbd5e1';
            if ($exp->category) {
                $cat_name = $exp->category->name;
                $cat_color = $exp->category->color;
            }

            $expenses_data[] = [
                'id' => $exp->id,
                'description' => $exp->description,
                'amount' => (float) $exp->amount,
                'date' => $exp->date->format('Y-m-d'),
                'category' => $cat_name,
                'category_color' => $cat_color,
                'notes' => $exp->notes,
                'receipt_url' => $exp->receipt_url,
            ];
        }

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
                'end_date' => $budget->end_date ? $budget->end_date->format('Y-m-d') : null,
                'categories' => $categories_list,
                'expenses' => $expenses_data,
            ],
        ]);
    }

    public function edit(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        return Inertia::render('Budget/Edit', [
            'budget' => $budget,
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'alert_threshold_percentage' => 'nullable|numeric',
            'status' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
        ]);

        $budget->name = $data['name'];
        $budget->description = $data['description'] ?? null;
        $budget->amount = $data['amount'];
        $budget->alert_threshold_percentage = $data['alert_threshold_percentage'] ?? 80;
        $budget->status = $data['status'];
        $budget->start_date = $data['start_date'];
        $budget->end_date = $data['end_date'] ?? null;
        $budget->save();

        return redirect()->route('budgets.show', $budget)->with('success', 'Budget mis à jour.');
    }

    public function destroy(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $budget->delete();

        return redirect()->route('budgets.index')->with('success', 'Budget supprimé.');
    }
}
