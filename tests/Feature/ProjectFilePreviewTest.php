<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProjectFilePreviewTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->user = User::factory()->create();
        $this->project = Project::create(['name' => 'P', 'color' => '#000', 'status' => 'active', 'owner_id' => $this->user->id]);
        $this->project->members()->attach($this->user->id, ['role' => 'owner']);
    }

    private function makeFile(string $name, string $content = 'contenu'): ProjectFile
    {
        $path = "project_files/{$this->project->id}/" . uniqid() . '-' . $name;
        Storage::disk('public')->put($path, $content);

        return ProjectFile::create([
            'project_id' => $this->project->id,
            'user_id'    => $this->user->id,
            'name'       => $name,
            'file_path'  => $path,
            'mime_type'  => 'application/octet-stream',
            'size'       => strlen($content),
        ]);
    }

    private function asMember()
    {
        return $this->actingAs($this->user)->withSession(['active_project_id' => $this->project->id]);
    }

    public function test_pdf_is_served_inline(): void
    {
        $file = $this->makeFile('Devis été.pdf', '%PDF-1.4');

        $response = $this->asMember()->get(route('projects.files.preview', $file));

        $response->assertOk();
        $this->assertSame('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringStartsWith('inline', $response->headers->get('Content-Disposition'));
        $this->assertSame('nosniff', $response->headers->get('X-Content-Type-Options'));
    }

    public function test_html_is_never_rendered(): void
    {
        $file = $this->makeFile('page.html', '<script>alert(1)</script>');

        $response = $this->asMember()->get(route('projects.files.preview', $file));

        $response->assertOk();
        $this->assertStringStartsWith('text/plain', $response->headers->get('Content-Type'));
    }

    public function test_svg_is_sandboxed(): void
    {
        $file = $this->makeFile('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');

        $response = $this->asMember()->get(route('projects.files.preview', $file));

        $response->assertOk();
        $this->assertStringContainsString('sandbox', $response->headers->get('Content-Security-Policy'));
    }

    public function test_unsupported_format_is_refused(): void
    {
        $file = $this->makeFile('rapport.docx');

        $this->asMember()->get(route('projects.files.preview', $file))->assertStatus(415);
    }

    public function test_non_member_cannot_preview(): void
    {
        $file = $this->makeFile('photo.png');
        $other = User::factory()->create();

        $this->actingAs($other)
            ->withSession(['active_project_id' => $this->project->id])
            ->get(route('projects.files.preview', $file))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $file = $this->makeFile('photo.png');

        $this->get(route('projects.files.preview', $file))->assertRedirect(route('login'));
    }
}
