<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Notifications\WorkspaceNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $alice;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create(['name' => 'Paul Martin']);
        $this->alice = User::factory()->create(['name' => 'Alice Durand']);
        $this->project = Project::create(['name' => 'Site', 'color' => '#000', 'status' => 'active', 'owner_id' => $this->owner->id]);
        $this->project->members()->attach($this->owner->id, ['role' => 'owner']);
        $this->project->members()->attach($this->alice->id, ['role' => 'editor']);
    }

    private function as(User $u)
    {
        return $this->actingAs($u)->withSession(['active_project_id' => $this->project->id]);
    }

    public function test_assigning_several_people_notifies_them(): void
    {
        Notification::fake();

        $this->as($this->owner)->post('/tasks', [
            'title' => 'Maquette', 'status' => 'todo', 'priority' => 'high',
            'assignee_ids' => [$this->alice->id, $this->owner->id],
        ])->assertSessionHasNoErrors();

        $task = Task::firstOrFail();
        $this->assertSame($this->alice->id, $task->assignee_id);
        $this->assertCount(2, $task->assignedUsers);
        Notification::assertSentTo($this->alice, WorkspaceNotification::class, fn ($n) => $n->type === 'task_assigned');
        Notification::assertNotSentTo($this->owner, WorkspaceNotification::class); // pas soi-même
    }

    public function test_non_member_cannot_be_assigned(): void
    {
        $stranger = User::factory()->create();

        $this->as($this->owner)->post('/tasks', [
            'title' => 'X', 'status' => 'todo', 'priority' => 'low', 'assignee_ids' => [$stranger->id],
        ]);

        $this->assertCount(0, Task::firstOrFail()->assignedUsers);
    }

    public function test_member_comment_with_mention_notifies_mentioned_person(): void
    {
        $task = Task::create(['user_id' => $this->owner->id, 'project_id' => $this->project->id, 'title' => 'T', 'status' => 'todo', 'priority' => 'medium']);
        $bob = User::factory()->create(['name' => 'Bob Leroy']);
        $this->project->members()->attach($bob->id, ['role' => 'viewer']);

        // Un lecteur peut commenter ; il mentionne Alice.
        $this->as($bob)->post(route('tasks.comments.store', $task), ['body' => 'Tu peux regarder @Alice Durand ?'])
            ->assertSessionHasNoErrors();

        $this->assertSame('mention', $this->alice->notifications()->first()->data['type']);
        // Le créateur de la tâche est prévenu du commentaire.
        $this->assertSame('comment', $this->owner->notifications()->first()->data['type']);
        $this->assertCount(0, $bob->notifications);
    }

    public function test_notification_endpoints(): void
    {
        $this->alice->notify(new WorkspaceNotification('comment', 'Hello', route('tasks.index')));

        $this->as($this->alice)->getJson(route('notifications.index'))->assertJsonPath('unread', 1);
        $id = $this->alice->notifications()->first()->id;
        $this->as($this->alice)->get(route('notifications.open', $id))->assertRedirect(route('tasks.index'));
        $this->assertSame(0, $this->alice->unreadNotifications()->count());
    }

    public function test_event_reminder_is_sent_once(): void
    {
        $event = Event::create([
            'user_id' => $this->owner->id, 'project_id' => $this->project->id, 'title' => 'Point', 'type' => 'meeting',
            'start_at' => now()->addMinutes(10), 'end_at' => now()->addMinutes(70), 'all_day' => false,
            'reminder' => true, 'reminder_minutes' => 15,
        ]);
        $event->participants()->attach($this->alice->id);

        $this->artisan('reminders:send')->assertSuccessful();
        $this->artisan('reminders:send')->assertSuccessful();

        $this->assertSame(1, $this->alice->notifications()->count());
        $this->assertSame(1, $this->owner->notifications()->count());
    }

    public function test_due_tomorrow_reminder(): void
    {
        $task = Task::create(['user_id' => $this->owner->id, 'project_id' => $this->project->id, 'title' => 'Livrer', 'status' => 'todo', 'priority' => 'high', 'due_date' => now()->addDay()->toDateString(), 'assignee_id' => $this->alice->id]);

        $this->artisan('reminders:send --due')->assertSuccessful();
        $this->artisan('reminders:send --due')->assertSuccessful();

        $this->assertSame(1, $this->alice->notifications()->count());
        $this->assertSame('due_soon', $this->alice->notifications()->first()->data['type']);
    }

    public function test_bell_is_immediate_while_email_is_queued(): void
    {
        config(['queue.default' => 'database']);
        \Illuminate\Support\Facades\Queue::fake();

        $this->alice->notify(new WorkspaceNotification('task_assigned', 'Hello', route('tasks.index'), mail: true));

        // Cloche : connexion « sync » (exécutée immédiatement en production).
        \Illuminate\Support\Facades\Queue::assertPushed(
            \Illuminate\Notifications\SendQueuedNotifications::class,
            fn ($job) => $job->channels === ['database'] && $job->connection === 'sync',
        );
        // E-mail : file d'attente par défaut, traité par le worker.
        \Illuminate\Support\Facades\Queue::assertPushed(
            \Illuminate\Notifications\SendQueuedNotifications::class,
            fn ($job) => $job->channels === ['mail'] && $job->connection !== 'sync',
        );
    }
}
