<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function getActiveProject(): ?Project
    {
        $projectId = session('active_project_id');
        if (!$projectId) return null;
        $project = Project::find($projectId);
        if (!$project || !$project->isMember(auth()->user())) return null;
        return $project;
    }

    /**
     * Export des tâches du projet en CSV.
     */
    public function exportTasks(): StreamedResponse
    {
        $project = $this->getActiveProject();
        if (!$project) {
            abort(403);
        }

        $filename = "taches_projet_" . \Illuminate\Support\Str::slug($project->name) . "_" . date('Y-m-d') . ".csv";

        $tasks = Task::where('project_id', $project->id)
            ->with(['assignee', 'user'])
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($tasks) {
            $file = fopen('php://output', 'w');
            // BOM UTF-8 pour Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['ID', 'Titre', 'Statut', 'Priorité', 'Assigné à', 'Créé par', 'Date d\'échéance', 'Date de création']);

            $statusMap = [
                'todo'        => 'À faire',
                'in_progress' => 'En cours',
                'done'        => 'Terminée',
                'completed'   => 'Terminée',
            ];

            foreach ($tasks as $task) {
                fputcsv($file, [
                    $task->id,
                    $task->title,
                    $statusMap[$task->status] ?? $task->status,
                    strtoupper($task->priority),
                    $task->assignee ? $task->assignee->name : 'Non assigné',
                    $task->user ? $task->user->name : '-',
                    $task->due_date ? $task->due_date->format('Y-m-d') : '-',
                    $task->created_at->format('Y-m-d H:i'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export des dépenses du projet en CSV.
     */
    public function exportExpenses(): StreamedResponse
    {
        $project = $this->getActiveProject();
        if (!$project) {
            abort(403);
        }

        $filename = "depenses_projet_" . \Illuminate\Support\Str::slug($project->name) . "_" . date('Y-m-d') . ".csv";

        $budget = Budget::where('project_id', $project->id)->where('status', 'active')->first();
        $expenses = $budget
            ? Expense::where('budget_id', $budget->id)->with('category')->orderBy('date', 'desc')->get()
            : collect();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($expenses) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, ['ID', 'Description', 'Montant (€)', 'Catégorie', 'Date', 'Notes']);

            foreach ($expenses as $exp) {
                fputcsv($file, [
                    $exp->id,
                    $exp->description,
                    number_format($exp->amount, 2, ',', ' '),
                    $exp->category ? $exp->category->name : 'Sans catégorie',
                    $exp->date->format('Y-m-d'),
                    $exp->notes ?? '',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
