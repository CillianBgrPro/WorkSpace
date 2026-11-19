<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductivityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->project = $this->makeProject('A');
    }

    private function makeProject(string $name): Project
    {
        $p = Project::create(['name' => $name, 'color' => '#000', 'status' => 'active', 'owner_id' => $this->user->id]);
        $p->members()->attach($this->user->id, ['role' => 'owner']);

        return $p;
    }

    private function task(array $attrs = [], ?Project $project = null): Task
    {
        $t = Task::create(array_merge(['user_id' => $this->user->id, 'project_id' => ($project ?? $this->project)->id, 'title' => 'T', 'status' => 'todo', 'priority' => 'medium'], $attrs));
        if (isset($attrs['recurrence'])) {
            $t->forceFill(['recurrence' => $attrs['recurrence']])->save();
        }

        return $t;
    }

    private function as()
    {
        return $this->actingAs($this->user)->withSession(['active_project_id' => $this->project->id]);
    }

    public function test_completing_a_weekly_task_creates_the_next_one(): void
    {
        $task = $this->task(['title' => 'Point hebdo', 'due_date' => '2026-11-20', 'recurrence' => 'weekly']);
        $task->assignedUsers()->attach($this->user->id);

        $this->as()->patch(route('tasks.status', $task), ['status' => 'done'])->assertSessionHas('success');

        $next = Task::where('title', 'Point hebdo')->where('status', 'todo')->firstOrFail();
        $this->assertSame('2026-11-27', substr($next->due_date, 0, 10));
        $this->assertSame('weekly', $next->recurrence);
        $this->assertNull($task->fresh()->recurrence);
        $this->assertCount(1, $next->assignedUsers);
    }

    public function test_kanban_reorder_sets_positions_and_status(): void
    {
        $a = $this->task(['title' => 'A']);
        $b = $this->task(['title' => 'B', 'status' => 'in_progress']);

        $this->as()->patch(route('tasks.reorder'), ['status' => 'in_progress', 'ids' => [$a->id, $b->id]]);

        $this->assertSame('in_progress', $a->fresh()->status);
        $this->assertSame(1, $a->fresh()->position);
        $this->assertSame(2, $b->fresh()->position);
    }

    public function test_my_tasks_lists_open_tasks_across_projects(): void
    {
        $other = $this->makeProject('B');
        $this->task(['title' => 'Ici', 'assignee_id' => $this->user->id]);
        $this->task(['title' => 'Là-bas', 'assignee_id' => $this->user->id], $other);
        $this->task(['title' => 'Finie', 'assignee_id' => $this->user->id, 'status' => 'done']);

        $this->as()->get(route('tasks.mine'))
            ->assertInertia(fn ($page) => $page->component('Tasks/Mine')->has('tasks', 2));
    }

    public function test_opening_a_task_of_another_project_switches_active_project(): void
    {
        $other = $this->makeProject('B');
        $task = $this->task([], $other);

        $this->as()->get(route('tasks.show', $task))->assertOk();
        $this->assertSame($other->id, session('active_project_id'));
    }

    public function test_project_from_template_gets_tasks(): void
    {
        $this->actingAs($this->user)->post(route('projects.store'), ['name' => 'Nouveau site', 'template' => 'website'])
            ->assertSessionHas('success');

        $project = Project::where('name', 'Nouveau site')->firstOrFail();
        $this->assertSame(8, Task::where('project_id', $project->id)->count());
    }

    public function test_project_duplicate_copies_task_structure(): void
    {
        $parent = $this->task(['title' => 'Parent', 'due_date' => '2026-12-01', 'status' => 'done']);
        $this->task(['title' => 'Enfant', 'parent_task_id' => $parent->id]);

        $this->actingAs($this->user)->post(route('projects.store'), ['name' => 'Copie', 'source_project_id' => $this->project->id]);

        $copy = Project::where('name', 'Copie')->firstOrFail();
        $newParent = Task::where('project_id', $copy->id)->where('title', 'Parent')->firstOrFail();
        $this->assertSame('todo', $newParent->status);
        $this->assertNull($newParent->due_date);
        $this->assertSame($newParent->id, Task::where('project_id', $copy->id)->where('title', 'Enfant')->value('parent_task_id'));
    }

    public function test_cannot_duplicate_someone_elses_project(): void
    {
        $stranger = User::factory()->create();
        $foreign = Project::create(['name' => 'Secret', 'color' => '#000', 'status' => 'active', 'owner_id' => $stranger->id]);

        $this->actingAs($this->user)->post(route('projects.store'), ['name' => 'Vol', 'source_project_id' => $foreign->id])->assertForbidden();
        $this->assertDatabaseMissing('projects', ['name' => 'Vol']);
    }
}
