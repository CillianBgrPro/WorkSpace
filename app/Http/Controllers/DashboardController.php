<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user_id = auth()->id();

        // récupere toutes les taches de l'user
        $totalTasks = Task::where('user_id', $user_id)->count();
        $completedTasks = Task::where('user_id', $user_id)->where('status', 'completed')->orWhere('status', 'done')->where('user_id', $user_id)->count();
        $remainingTasks = $totalTasks - $completedTasks;

        // calcul du pourcentage
        if ($totalTasks > 0) {
            $taskProgress = round(($completedTasks / $totalTasks) * 100, 2);
        } else {
            $taskProgress = 0;
        }

        // budget actif
        $budget = Budget::where('user_id', $user_id)->where('status', 'active')->first();

        if ($budget) {
            $totalBudget = (float) $budget->total_amount;
            $spentBudget = (float) $budget->expenses()->sum('amount');
        } else {
            $totalBudget = 0;
            $spentBudget = 0;
        }

        $remainingBudget = $totalBudget - $spentBudget;
        if ($remainingBudget < 0) {
            $remainingBudget = 0;
        }

        if ($totalBudget > 0) {
            $budgetProgress = round(($spentBudget / $totalBudget) * 100, 2);
        } else {
            $budgetProgress = 0;
        }

        // les 5 dernieres taches
        $recentTasks = Task::where('user_id', $user_id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'status', 'created_at']);

        // les 5 derniers depenses
        if ($budget) {
            $recentExpenses = $budget->expenses()->orderBy('created_at', 'desc')->limit(5)->get(['id', 'description', 'amount', 'created_at']);
        } else {
            $recentExpenses = collect();
        }

        // taches avec deadline bientot
        $upcoming_tasks = Task::where('user_id', $user_id)
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
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
            'upcomingDeadlines' => $upcoming_tasks,
        ]);
    }
}
