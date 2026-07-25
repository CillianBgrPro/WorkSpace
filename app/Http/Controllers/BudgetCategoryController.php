<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BudgetCategoryController extends Controller
{
    public function store(Request $request, Budget $budget)
    {
        $user = auth()->user();
        if (!$budget->project || !$budget->project->canEdit($user)) {
            abort(403);
        }

        $data = $request->validate([
            'category_name'  => 'required|string|max:255',
            'category_color' => 'nullable|string',
        ]);

        $category = new BudgetCategory();
        $category->budget_id = $budget->id;
        $category->name       = $data['category_name'];
        $category->color      = $data['category_color'] ?? '#6366f1';
        $category->save();

        ActivityLog::record(
            $budget->project,
            $user,
            'budget_category_created',
            "a ajouté la catégorie de budget : {$category->name}"
        );

        return back()->with('success', 'Catégorie ajoutée.');
    }

    public function destroy(Request $request, BudgetCategory $category)
    {
        $user = auth()->user();
        $budget = $category->budget;
        if (!$budget || !$budget->project || !$budget->project->canEdit($user)) {
            abort(403);
        }

        $catName = $category->name;
        $category->delete();

        ActivityLog::record(
            $budget->project,
            $user,
            'budget_category_deleted',
            "a supprimé la catégorie de budget : {$catName}"
        );

        return back()->with('success', 'Catégorie supprimée.');
    }
}
