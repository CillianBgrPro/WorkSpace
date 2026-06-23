<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBudgetCategoryRequest;
use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Http\Request;

class BudgetCategoryController extends Controller
{
    public function store(Request $request, Budget $budget)
    {
        abort_unless($budget->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'category_name' => ['required', 'string', 'max:255'],
            'category_color' => ['nullable', 'string', 'regex:/^#[0-9A-F]{6}$/i'],
        ]);

        BudgetCategory::create([
            'budget_id' => $budget->id,
            'name' => $data['category_name'],
            'color' => $data['category_color'] ?? '#6366f1',
        ]);

        return back()->with('success', 'Catégorie ajoutée.');
    }

    public function destroy(Request $request, BudgetCategory $category)
    {
        abort_unless($category->budget->user_id === $request->user()->id, 403);

        $category->delete();

        return back()->with('success', 'Catégorie supprimée.');
    }
}
