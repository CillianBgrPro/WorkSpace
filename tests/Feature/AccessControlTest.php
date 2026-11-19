<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\BudgetCategory;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private Project $mine;
    private Project $other;

    protected function setUp(): void
    {
        parent::setUp();
        $this->owner = User::factory()->create();
        $this->mine = $this->project($this->owner);
        $this->other = $this->project(User::factory()->create());
    }

    private function project(User $owner): Project
    {
        $p = Project::create(['name' => 'P' . $owner->id, 'color' => '#000', 'status' => 'active', 'owner_id' => $owner->id]);
        $p->members()->attach($owner->id, ['role' => 'owner']);

        return $p;
    }

    private function as(?User $u = null, ?Project $p = null)
    {
        return $this->actingAs($u ?? $this->owner)->withSession(['active_project_id' => ($p ?? $this->mine)->id]);
    }

    public function test_removed_member_with_stale_session_cannot_write(): void
    {
        $ex = User::factory()->create();
        // Session restée sur un projet dont il n'est pas membre.
        $this->as($ex)->post('/budgets', ['name' => 'B', 'amount' => 1, 'status' => 'active', 'start_date' => '2026-01-01'])
            ->assertRedirect(route('projects.index'));
        $this->as($ex)->post(route('calendar.store'), ['title' => 'E', 'type' => 'event', 'start_at' => '2026-01-01 10:00'])
            ->assertRedirect(route('projects.index'));

        $this->assertDatabaseCount('budgets', 0);
        $this->assertDatabaseCount('events', 0);
    }

    public function test_parent_task_must_belong_to_the_same_project(): void
    {
        $foreign = Task::create(['user_id' => $this->other->owner_id, 'project_id' => $this->other->id, 'title' => 'Secret', 'status' => 'todo', 'priority' => 'low']);

        $this->as()->post('/tasks', ['title' => 'Intrus', 'status' => 'todo', 'priority' => 'low', 'parent_task_id' => $foreign->id])
            ->assertSessionHasErrors('parent_task_id');
    }

    public function test_task_cannot_become_its_own_ancestor(): void
    {
        $parent = Task::create(['user_id' => $this->owner->id, 'project_id' => $this->mine->id, 'title' => 'A', 'status' => 'todo', 'priority' => 'low']);
        $child = Task::create(['user_id' => $this->owner->id, 'project_id' => $this->mine->id, 'title' => 'B', 'status' => 'todo', 'priority' => 'low', 'parent_task_id' => $parent->id]);

        $this->as()->put(route('tasks.update', $parent), ['title' => 'A', 'status' => 'todo', 'priority' => 'low', 'parent_task_id' => $child->id])
            ->assertSessionHasErrors('parent_task_id');
    }

    public function test_expense_category_must_belong_to_the_budget(): void
    {
        $budget = Budget::create(['user_id' => $this->owner->id, 'project_id' => $this->mine->id, 'name' => 'B', 'amount' => 100, 'status' => 'active', 'start_date' => '2026-01-01']);
        $otherBudget = Budget::create(['user_id' => $this->other->owner_id, 'project_id' => $this->other->id, 'name' => 'X', 'amount' => 100, 'status' => 'active', 'start_date' => '2026-01-01']);
        $foreignCategory = BudgetCategory::create(['budget_id' => $otherBudget->id, 'name' => 'C', 'color' => '#000']);

        $this->as()->post(route('budgets.expenses.store', $budget), ['description' => 'D', 'amount' => 5, 'date' => '2026-01-02', 'category_id' => $foreignCategory->id])
            ->assertSessionHasErrors('category_id');
    }

    public function test_receipt_url_rejects_javascript_links(): void
    {
        $budget = Budget::create(['user_id' => $this->owner->id, 'project_id' => $this->mine->id, 'name' => 'B', 'amount' => 100, 'status' => 'active', 'start_date' => '2026-01-01']);
        $cat = BudgetCategory::create(['budget_id' => $budget->id, 'name' => 'C', 'color' => '#000']);

        $this->as()->post(route('budgets.expenses.store', $budget), ['description' => 'D', 'amount' => 5, 'date' => '2026-01-02', 'category_id' => $cat->id, 'receipt_url' => 'javascript:alert(1)'])
            ->assertSessionHasErrors('receipt_url');
        $this->as()->post(route('budgets.expenses.store', $budget), ['description' => 'D', 'amount' => 5, 'date' => '2026-01-02', 'category_id' => $cat->id, 'receipt_url' => 'https://exemple.fr/recu.pdf'])
            ->assertSessionHasNoErrors();
    }

    public function test_only_project_members_can_join_a_team(): void
    {
        $team = Team::create(['name' => 'T', 'owner_id' => $this->owner->id, 'project_id' => $this->mine->id]);
        $stranger = User::factory()->create();

        $this->as()->post(route('teams.members.add', $team), ['member_id' => $stranger->id, 'role' => 'collaborateur'])
            ->assertSessionHasErrors('member_id');
    }

    public function test_event_participants_must_be_project_members(): void
    {
        $stranger = User::factory()->create();

        $this->as()->post(route('calendar.store'), ['title' => 'E', 'type' => 'event', 'start_at' => '2026-01-01 10:00', 'participants' => [$stranger->id]])
            ->assertStatus(422);
    }
}
