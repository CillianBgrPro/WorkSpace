<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function mockGoogleUser(string $id, string $email, bool $verified = true): void
    {
        $googleUser = (new SocialiteUser)->setRaw(['email_verified' => $verified])->map([
            'id' => $id,
            'name' => 'Jean Dupont',
            'email' => $email,
            'avatar' => 'https://example.com/a.png',
        ]);

        $provider = Mockery::mock(GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($googleUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_redirect_goes_to_google(): void
    {
        config(['services.google.client_id' => 'test-id', 'services.google.client_secret' => 'secret']);

        $this->get('/auth/google')->assertRedirectContains('accounts.google.com');
    }

    public function test_new_user_is_created_and_logged_in(): void
    {
        $this->mockGoogleUser('g-123', 'jean@example.com');

        $this->get('/auth/google/callback')->assertRedirect(route('projects.index', absolute: false));

        $user = User::where('email', 'jean@example.com')->firstOrFail();
        $this->assertSame('g-123', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_existing_user_is_linked_by_email(): void
    {
        $existing = User::factory()->create(['email' => 'jean@example.com']);
        $this->mockGoogleUser('g-456', 'jean@example.com');

        $this->get('/auth/google/callback');

        $this->assertSame('g-456', $existing->fresh()->google_id);
        $this->assertSame(1, User::count());
        $this->assertAuthenticatedAs($existing);
    }

    public function test_unverified_google_email_is_rejected(): void
    {
        $this->mockGoogleUser('g-789', 'x@example.com', verified: false);

        $this->get('/auth/google/callback')->assertRedirect(route('login'));
        $this->assertGuest();
        $this->assertSame(0, User::count());
    }

    public function test_register_with_existing_google_account_is_refused(): void
    {
        $existing = User::factory()->create(['email' => 'jean@example.com', 'google_id' => 'g-123']);
        $this->mockGoogleUser('g-123', 'jean@example.com');

        $this->withSession(['google_auth_intent' => 'register'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertSame(1, User::count());
    }

    public function test_register_with_email_of_existing_account_is_refused(): void
    {
        $existing = User::factory()->create(['email' => 'jean@example.com']);
        $this->mockGoogleUser('g-999', 'jean@example.com');

        $this->withSession(['google_auth_intent' => 'register'])
            ->get('/auth/google/callback')
            ->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertNull($existing->fresh()->google_id);
    }

    public function test_register_intent_is_stored_on_redirect(): void
    {
        config(['services.google.client_id' => 'test-id', 'services.google.client_secret' => 'secret']);

        $this->get('/auth/google?intent=register')->assertSessionHas('google_auth_intent', 'register');
    }
}
