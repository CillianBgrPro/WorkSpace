<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Stats des Taches Réalisés

        $totalTasks = Task::where('user_id', $request->user()->id)->count();
        $completedTasks = Task::where('user_id', $request->user()->id)
            ->whereIn('status', ['completed', 'done'])
            ->count();
        $remainingTasks = $totalTasks - $completedTasks;
        $taskProgress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        // Stats du Budget 
        $budget = Budget::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();
        $totalBudget = $budget ? (float) $budget->total_amount : 0.0;
        $spentBudget = $budget ? (float) $budget->expenses()->sum('amount') : 0.0;
        $remainingBudget = max($totalBudget - $spentBudget, 0);
        $budgetProgress = $totalBudget > 0 ? round(($spentBudget / $totalBudget) * 100, 2) : 0;

        // Relevés des 5 dernières Taches et 5 dernières Dépenses
        $recentTasks = Task::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'title', 'status', 'created_at']);
        $recentExpenses = $budget ? $budget->expenses()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'description', 'amount', 'created_at'])
            : collect();

        // Liste des Taches avec la Deadline la plus proche 
        $upcomingDeadlines = Task::where('user_id', $request->user()->id)
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now())
            ->orderBy('due_date')
            ->limit(5)
            ->get(['id', 'title', 'due_date']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalTasks' => $totalTasks,
                'completedTasks' => $completedTasks,
                'remainingTasks' => $remainingTasks,
                'taskProgress' => $taskProgress,
                'totalBudget' => $totalBudget,
                'spentBudget' => $spentBudget,
                'remainingBudget' => $remainingBudget,
                'budgetProgress' => $budgetProgress,
            ],
            'recentActivities' => [
                'tasks' => $recentTasks,
                'expenses' => $recentExpenses,
            ],
            'upcomingDeadlines' => $upcomingDeadlines,
        ]);
    }
}
