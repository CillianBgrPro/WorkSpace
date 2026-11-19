<?php

use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectFileController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaletteController;
use App\Http\Controllers\CalendarFeedController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ProfileController;

// page d'accueil
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// pages légales (requises pour la connexion Google)
Route::get('/confidentialite', fn () => Inertia::render('Legal', [
    'page' => 'privacy',
    'contact' => config('mail.from.address'),
    'updatedAt' => '19 novembre 2026',
]))->name('legal.privacy');

Route::get('/conditions', fn () => Inertia::render('Legal', [
    'page' => 'terms',
    'contact' => config('mail.from.address'),
    'updatedAt' => '19 novembre 2026',
]))->name('legal.terms');

// /dashboard redirige vers la sélection de projet
Route::get('/dashboard', function () {
    return redirect()->route('projects.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// Lien d'invitation à un projet (accessible connecté ou non)
Route::get('/invitations/{token}', [InvitationController::class, 'show'])
    ->where('token', '[A-Za-z0-9]{48}')
    ->name('invitations.show');

// Flux iCal personnel (sans session, protégé par un jeton secret)
Route::get('/calendar/feed/{token}.ics', CalendarFeedController::class)
    ->where('token', '[A-Za-z0-9]{48}')
    ->middleware('throttle:60,1')
    ->name('calendar.feed');

Route::middleware('auth')->group(function () {
    Route::get('/palette', PaletteController::class)->name('palette');

    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/preferences', [ProfileController::class, 'updatePreferences'])->name('profile.preferences');
    Route::post('/profile/calendar-token', [ProfileController::class, 'regenerateCalendarToken'])->name('profile.calendar-token');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // projets
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}/dashboard', [DashboardController::class, 'index'])->name('projects.dashboard');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])->name('projects.members.remove');
    Route::patch('/projects/{project}/members/{user}', [ProjectController::class, 'updateMemberRole'])->name('projects.members.role');
    Route::post('/projects/{project}/invitations/{invitation}/resend', [ProjectController::class, 'resendInvitation'])->name('projects.invitations.resend');
    Route::delete('/projects/{project}/invitations/{invitation}', [ProjectController::class, 'cancelInvitation'])->name('projects.invitations.cancel');

    // fichiers de projet
    Route::get('/project-files', [ProjectFileController::class, 'index'])->name('projects.files.index');
    Route::post('/project-files', [ProjectFileController::class, 'store'])->name('projects.files.store');
    Route::get('/project-files/{file}/download', [ProjectFileController::class, 'download'])->name('projects.files.download');
    Route::get('/project-files/{file}/preview', [ProjectFileController::class, 'preview'])->name('projects.files.preview');
    Route::delete('/project-files/{file}', [ProjectFileController::class, 'destroy'])->name('projects.files.destroy');

    // exports et rapports
    Route::get('/reports/tasks/csv', [ReportController::class, 'exportTasks'])->name('reports.tasks.csv');
    Route::get('/reports/expenses/csv', [ReportController::class, 'exportExpenses'])->name('reports.expenses.csv');

    // routes des taches
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/create', [TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tasks/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::patch('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // commentaires et pièces jointes des taches
    Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('comments/{comment}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])->middleware('project.editor')->name('tasks.attachments.store');
    Route::delete('attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->middleware('project.editor')->name('attachments.destroy');

    // Modules en écriture réservée aux éditeurs (les lecteurs consultent seulement)
    Route::middleware('project.editor')->group(function () {
    // calendrier
    Route::get('/calendar', [EventController::class, 'index'])->name('calendar.index');
    Route::post('/calendar', [EventController::class, 'store'])->name('calendar.store');
    Route::put('/calendar/{calendar}', [EventController::class, 'update'])->name('calendar.update');
    Route::patch('/calendar/{calendar}', [EventController::class, 'update']);
    Route::delete('/calendar/{calendar}', [EventController::class, 'destroy'])->name('calendar.destroy');
    Route::patch('calendar/{event}/move', [EventController::class, 'move'])->name('calendar.move');

    // teams
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}/edit', [TeamController::class, 'edit'])->name('teams.edit');
    Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::patch('/teams/{team}', [TeamController::class, 'update']);
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::post('teams/{team}/members', [TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('teams.members.remove');

    // budgets
    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::get('/budgets/create', [BudgetController::class, 'create'])->name('budgets.create');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('budgets.store');
    Route::get('/budgets/{budget}', [BudgetController::class, 'show'])->name('budgets.show');
    Route::get('/budgets/{budget}/edit', [BudgetController::class, 'edit'])->name('budgets.edit');
    Route::put('/budgets/{budget}', [BudgetController::class, 'update'])->name('budgets.update');
    Route::patch('/budgets/{budget}', [BudgetController::class, 'update']);
    Route::delete('/budgets/{budget}', [BudgetController::class, 'destroy'])->name('budgets.destroy');

    // categories de budget
    Route::post('budgets/{budget}/categories', [BudgetCategoryController::class, 'store'])->name('budgets.categories.store');
    Route::delete('categories/{category}', [BudgetCategoryController::class, 'destroy'])->name('categories.destroy');

    // dépenses
    Route::post('budgets/{budget}/expenses', [ExpenseController::class, 'store'])->name('budgets.expenses.store');
    Route::patch('expenses/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('expenses/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    });

});

require __DIR__.'/auth.php';
