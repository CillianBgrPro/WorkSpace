<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\AddedToProjectNotification;
use App\Notifications\ProjectInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProjectMembersTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->owner = User::factory()->create();
        $this->project = Project::create(['name' => 'Site', 'color' => '#000', 'status' => 'active', 'owner_id' => $this->owner->id]);
        $this->project->members()->attach($this->owner->id, ['role' => 'owner']);
    }

    public function test_existing_user_is_added_directly_and_notified(): void
    {
        $alice = User::factory()->create(['email' => 'alice@example.com']);

        $this->actingAs($this->owner)
            ->post(route('projects.members.add', $this->project), ['email' => 'ALICE@example.com', 'role' => 'viewer'])
            ->assertSessionHasNoErrors();

        $this->assertSame('viewer', $this->project->getMemberRole($alice));
        Notification::assertSentTo($alice, AddedToProjectNotification::class);
    }

    public function test_unknown_email_receives_an_invitation(): void
    {
        $this->actingAs($this->owner)
            ->post(route('projects.members.add', $this->project), ['email' => 'nouveau@example.com'])
            ->assertSessionHasNoErrors();

        $invitation = ProjectInvitation::firstOrFail();
        $this->assertSame('editor', $invitation->role);
        Notification::assertSentOnDemand(ProjectInvitationNotification::class, fn ($n, $c, AnonymousNotifiable $to) => $to->routes['mail'] === 'nouveau@example.com');
    }

    public function test_guest_accepts_invitation_by_registering(): void
    {
        $invitation = ProjectInvitation::issue($this->project, $this->owner, 'nouveau@example.com', 'editor');

        $this->get(route('invitations.show', $invitation->token))->assertOk();

        $this->post('/register', [
            'name' => 'Nouveau', 'email' => 'nouveau@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertRedirect(route('projects.dashboard', $this->project));

        $user = User::where('email', 'nouveau@example.com')->firstOrFail();
        $this->assertTrue($this->project->isMember($user));
        $this->assertNotNull($invitation->fresh()->accepted_at);
    }

    public function test_logged_in_user_accepts_invitation_immediately(): void
    {
        $bob = User::factory()->create();
        $invitation = ProjectInvitation::issue($this->project, $this->owner, $bob->email, 'viewer');

        $this->actingAs($bob)->get(route('invitations.show', $invitation->token))
            ->assertRedirect(route('projects.dashboard', $this->project));

        $this->assertSame('viewer', $this->project->getMemberRole($bob));
    }

    public function test_expired_invitation_is_rejected(): void
    {
        $bob = User::factory()->create();
        $invitation = ProjectInvitation::issue($this->project, $this->owner, $bob->email, 'editor');
        $invitation->forceFill(['expires_at' => now()->subDay()])->save();

        $this->actingAs($bob)->get(route('invitations.show', $invitation->token))->assertOk();
        $this->assertFalse($this->project->isMember($bob));
    }

    public function test_viewer_cannot_create_budget(): void
    {
        $viewer = User::factory()->create();
        $this->project->members()->attach($viewer->id, ['role' => 'viewer']);

        $this->actingAs($viewer)->withSession(['active_project_id' => $this->project->id])
            ->post('/budgets', ['name' => 'B', 'amount' => 10, 'status' => 'active', 'start_date' => '2026-01-01'])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_owner_changes_role_and_editor_cannot_manage_members(): void
    {
        $editor = User::factory()->create();
        $this->project->members()->attach($editor->id, ['role' => 'editor']);

        $this->actingAs($editor)
            ->post(route('projects.members.add', $this->project), ['email' => 'x@example.com'])
            ->assertForbidden();

        $this->actingAs($this->owner)
            ->patch(route('projects.members.role', [$this->project, $editor]), ['role' => 'admin'])
            ->assertSessionHasNoErrors();

        $this->assertSame('admin', $this->project->getMemberRole($editor));
    }

    public function test_member_can_leave_project(): void
    {
        $editor = User::factory()->create();
        $this->project->members()->attach($editor->id, ['role' => 'editor']);

        $this->actingAs($editor)
            ->delete(route('projects.members.remove', [$this->project, $editor]))
            ->assertRedirect(route('projects.index'));

        $this->assertFalse($this->project->isMember($editor));
    }

    public function test_existing_member_does_not_consume_someone_elses_invitation(): void
    {
        $invitation = ProjectInvitation::issue($this->project, $this->owner, 'quelquun@example.com', 'editor');

        $this->actingAs($this->owner)->get(route('invitations.show', $invitation->token))
            ->assertRedirect(route('projects.dashboard', $this->project));

        $this->assertTrue($invitation->fresh()->isPending());
    }
}
