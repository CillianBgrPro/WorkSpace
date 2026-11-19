<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TrashTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->owner = User::factory()->create();
        $this->project = Project::create(['name' => 'P', 'color' => '#000', 'status' => 'active', 'owner_id' => $this->owner->id]);
        $this->project->members()->attach($this->owner->id, ['role' => 'owner']);
    }

    private function as(?User $u = null)
    {
        return $this->actingAs($u ?? $this->owner)->withSession(['active_project_id' => $this->project->id]);
    }

    private function task(array $a = []): Task
    {
        return Task::create(array_merge(['user_id' => $this->owner->id, 'project_id' => $this->project->id, 'title' => 'T', 'status' => 'todo', 'priority' => 'medium'], $a));
    }

    public function test_deleting_a_task_trashes_subtasks_and_offers_undo(): void
    {
        $parent = $this->task(['title' => 'Parent']);
        $child = $this->task(['title' => 'Enfant', 'parent_task_id' => $parent->id]);

        $this->as()->delete(route('tasks.destroy', $parent))->assertSessionHas('undo');

        $this->assertSoftDeleted($parent);
        $this->assertSoftDeleted($child);
        $this->assertSame($this->owner->id, Task::withTrashed()->find($parent->id)->deleted_by);

        $this->as()->post(route('trash.restore', ['task', $parent->id]));
        $this->assertNotSoftDeleted($parent);
        $this->assertNotSoftDeleted($child);
    }

    public function test_trash_page_lists_items(): void
    {
        $this->task(['title' => 'Perdue'])->delete();

        $this->as()->get(route('trash.index'))
            ->assertInertia(fn ($p) => $p->component('Trash/Index')->has('items', 1)->where('items.0.label', 'Perdue'));
    }

    public function test_file_stays_on_disk_until_purged(): void
    {
        Storage::disk('local')->put('project_files/1/a.pdf', 'x');
        $file = ProjectFile::create(['project_id' => $this->project->id, 'user_id' => $this->owner->id, 'name' => 'a.pdf', 'file_path' => 'project_files/1/a.pdf', 'mime_type' => 'application/pdf', 'size' => 1]);

        $this->as()->delete(route('projects.files.destroy', $file));
        Storage::disk('local')->assertExists('project_files/1/a.pdf');

        $this->travel(31)->days();
        $this->artisan('trash:purge')->assertSuccessful();

        Storage::disk('local')->assertMissing('project_files/1/a.pdf');
        $this->assertDatabaseMissing('project_files', ['id' => $file->id]);
    }

    public function test_recent_items_are_not_purged(): void
    {
        $task = $this->task();
        $task->delete();

        $this->travel(10)->days();
        $this->artisan('trash:purge');

        $this->assertSoftDeleted($task);
    }

    public function test_owner_restores_a_deleted_project(): void
    {
        $this->as()->delete(route('projects.destroy', $this->project))->assertSessionHas('undo');
        $this->assertSoftDeleted($this->project);

        $this->actingAs($this->owner)->post(route('trash.restore', ['project', $this->project->id]))
            ->assertRedirect(route('projects.dashboard', $this->project));
        $this->assertNotSoftDeleted($this->project);
    }

    public function test_viewer_cannot_restore_and_editor_cannot_purge(): void
    {
        $viewer = User::factory()->create();
        $editor = User::factory()->create();
        $this->project->members()->attach($viewer->id, ['role' => 'viewer']);
        $this->project->members()->attach($editor->id, ['role' => 'editor']);
        $task = $this->task();
        $task->delete();

        $this->as($viewer)->post(route('trash.restore', ['task', $task->id]))->assertForbidden();
        $this->as($editor)->delete(route('trash.destroy', ['task', $task->id]))->assertForbidden();

        $this->as()->delete(route('trash.destroy', ['task', $task->id]));
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
