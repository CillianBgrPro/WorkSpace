<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Budget;
use App\Models\Project;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Dashboard propre à un projet — le projet est passé dans l'URL.
     * Ex : GET /projects/3/dashboard
     */
    public function index(Request $request, Project $project)
    {
        // Vérifier que l'user est membre du projet
        if (!$project->isMember(auth()->user())) {
            abort(403, 'Accès refusé à ce projet.');
        }

        // Sync la session (pour que tâches / budgets / calendrier restent en phase)
        session([
            'active_project_id'    => $project->id,
            'active_project_name'  => $project->name,
            'active_project_color' => $project->color,
        ]);

        // ── Tâches du projet ──────────────────────────────────────────────
        $totalTasks = Task::where('project_id', $project->id)->count();

        $completedTasks = Task::where('project_id', $project->id)
            ->where(function ($q) {
                $q->where('status', 'completed')->orWhere('status', 'done');
            })
            ->count();

        $remainingTasks = $totalTasks - $completedTasks;
        $taskProgress   = $totalTasks > 0
            ? round(($completedTasks / $totalTasks) * 100, 2)
            : 0;

        // ── Budget actif du projet ────────────────────────────────────────
        $budget = Budget::where('project_id', $project->id)
            ->where('status', 'active')
            ->first();

        $totalBudget = $budget ? (float) $budget->amount : 0;
        $spentBudget = $budget ? (float) $budget->expenses()->sum('amount') : 0;
        $remainingBudget = max(0, $totalBudget - $spentBudget);
        $budgetProgress  = $totalBudget > 0
            ? round(($spentBudget / $totalBudget) * 100, 2)
            : 0;

        // ── Activités récentes ────────────────────────────────────────────
        $recentTasks = Task::where('project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'status', 'created_at']);

        $recentExpenses = $budget
            ? $budget->expenses()->orderBy('created_at', 'desc')->limit(5)->get(['id', 'description', 'amount', 'created_at'])
            : collect();

        // ── Journal d'activités ───────────────────────────────────────────
        $activityLogs = ActivityLog::where('project_id', $project->id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // ── Prochaines échéances ──────────────────────────────────────────
        $upcomingTasks = Task::where('project_id', $project->id)
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get(['id', 'title', 'due_date']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalTasks'      => $totalTasks,
                'completedTasks'  => $completedTasks,
                'remainingTasks'  => $remainingTasks,
                'taskProgress'    => $taskProgress,
                'totalBudget'     => $totalBudget,
                'spentBudget'     => $spentBudget,
                'remainingBudget' => $remainingBudget,
                'budgetProgress'  => $budgetProgress,
            ],
            'recentActivities' => [
                'tasks'    => $recentTasks,
                'expenses' => $recentExpenses,
            ],
            'activityLogs'      => $activityLogs,
            'upcomingDeadlines' => $upcomingTasks,
            'activeProject'     => [
                'id'    => $project->id,
                'name'  => $project->name,
                'color' => $project->color,
            ],
            'userRole'          => $project->getMemberRole(auth()->user()),
        ]);
    }
}
