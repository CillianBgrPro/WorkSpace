<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Notifications\WorkspaceNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_headers_and_csp_are_sent(): void
    {
        $response = $this->get('/login');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $csp = $response->headers->get('Content-Security-Policy');
        $this->assertStringContainsString("script-src 'self' 'nonce-", $csp);
        $this->assertStringContainsString("object-src 'none'", $csp);
        // Le nonce est bien posé sur les scripts de la page.
        preg_match("/'nonce-([^']+)'/", $csp, $m);
        $this->assertStringContainsString('nonce="' . $m[1] . '"', $response->getContent());
    }

    public function test_csv_export_neutralises_formulas(): void
    {
        $user = User::factory()->create();
        $project = Project::create(['name' => 'P', 'color' => '#000', 'status' => 'active', 'owner_id' => $user->id]);
        $project->members()->attach($user->id, ['role' => 'owner']);
        Task::create(['user_id' => $user->id, 'project_id' => $project->id, 'title' => '=HYPERLINK("http://evil","x")', 'status' => 'todo', 'priority' => 'low']);

        $csv = $this->actingAs($user)->withSession(['active_project_id' => $project->id])
            ->get(route('reports.tasks.csv'))->streamedContent();

        $this->assertStringContainsString("'=HYPERLINK", $csv);
    }

    public function test_notification_never_redirects_to_another_domain(): void
    {
        $user = User::factory()->create();
        $user->notify(new WorkspaceNotification('comment', 'x', 'https://workspace.baugercillian.fr.evil.com/piege'));

        $this->actingAs($user)->get(route('notifications.open', $user->notifications()->first()->id))
            ->assertRedirect(route('projects.index', absolute: false));
    }
}
