<?php



use App\Http\Controllers\TaskAttachmentController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TeamController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {


    Route::patch('calendar/{event}/move', [EventController::class, 'move'])->name('calendar.move');


    Route::delete('comments/{comment}', [TaskCommentController::class, 'destroy'])
        ->name('comments.destroy');
    Route::delete('attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])
        ->name('attachments.destroy');

    Route::resource('tasks', TaskController::class);

    Route::post('tasks/{task}/attachments', [TaskAttachmentController::class, 'store'])
        ->name('tasks.attachments.store');
    Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store'])
        ->name('tasks.comments.store');
        
    Route::resource('calendar', EventController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('teams', TeamController::class)->except(['show']);
    Route::post('teams/{team}/members', [TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('teams.members.remove');

    Route::resource('budgets', \App\Http\Controllers\BudgetController::class);
    Route::post('budgets/{budget}/categories', [\App\Http\Controllers\BudgetCategoryController::class, 'store'])
        ->name('budgets.categories.store');
    Route::delete('categories/{category}', [\App\Http\Controllers\BudgetCategoryController::class, 'destroy'])
        ->name('categories.destroy');
    Route::post('budgets/{budget}/expenses', [\App\Http\Controllers\ExpenseController::class, 'store'])
        ->name('budgets.expenses.store');
    Route::delete('expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'destroy'])
        ->name('expenses.destroy');
    Route::patch('expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'update'])
        ->name('expenses.update');

});

require __DIR__.'/auth.php';
