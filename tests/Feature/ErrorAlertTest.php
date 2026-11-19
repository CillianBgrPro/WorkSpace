<?php

namespace Tests\Feature;

use App\Support\ErrorAlert;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ErrorAlertTest extends TestCase
{
    public function test_alert_is_sent_once_per_hour_in_production(): void
    {
        Mail::fake();
        config(['services.error_alerts.email' => 'admin@example.com']);
        $this->app['env'] = 'production';

        $e = new \RuntimeException('Boom');
        ErrorAlert::send($e);
        ErrorAlert::send($e);

        Mail::assertSentCount(1);
    }

    public function test_no_alert_outside_production(): void
    {
        Mail::fake();
        config(['services.error_alerts.email' => 'admin@example.com']);

        ErrorAlert::send(new \RuntimeException('Boom'));

        Mail::assertNothingSent();
    }
}
