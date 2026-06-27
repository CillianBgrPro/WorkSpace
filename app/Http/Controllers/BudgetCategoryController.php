<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetCategory;
use Illuminate\Http\Request;

class BudgetCategoryController extends Controller
{
    public function store(Request $request, Budget $budget)
    {
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $data = $request->validate([
            'category_name' => 'required|string|max:255',
            'category_color' => 'nullable|string',
        ]);

        $category = new BudgetCategory();
        $category->budget_id = $budget->id;
        $category->name = $data['category_name'];
        $category->color = $data['category_color'] ?? '#6366f1';
        $category->save();

        return back()->with('success', 'Catégorie ajoutée.');
    }

    public function destroy(Request $request, BudgetCategory $category)
    {
        // on verifie que c'est bien le budget de l'user
        $budget = $category->budget;
        if ($budget->user_id != auth()->id()) {
            abort(403);
        }

        $category->delete();

        return back()->with('success', 'Catégorie supprimée.');
    }
}
