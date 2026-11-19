<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Rappels (nécessite la tâche cron « schedule:run » chaque minute sur le serveur).
Schedule::command('reminders:send')->everyMinute()->withoutOverlapping();
Schedule::command('reminders:send --due')->dailyAt('08:00');
Schedule::command('trash:purge')->dailyAt('03:30');
Schedule::command('backup:run')->dailyAt('03:00')->onFailure(fn () => report(new RuntimeException('La sauvegarde quotidienne a échoué.')));
