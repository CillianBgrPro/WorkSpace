<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class AccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_linking_neutralises_a_pre_hijacked_account(): void
    {
        // L'attaquant crée un compte avec l'adresse de la victime (jamais vérifiée).
        $squatted = User::factory()->unverified()->create(['email' => 'victime@example.com', 'password' => 'mot-de-passe-attaquant']);

        $google = (new SocialiteUser)->setRaw(['email_verified' => true])->map(['id' => 'g-1', 'name' => 'Victime', 'email' => 'victime@example.com']);
        $provider = Mockery::mock(GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($google);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/auth/google/callback');

        $user = $squatted->fresh();
        $this->assertFalse(Hash::check('mot-de-passe-attaquant', $user->password));
        $this->assertFalse($user->has_password);
        $this->assertTrue($user->hasVerifiedEmail());
    }

    public function test_verified_account_keeps_its_password_when_linking_google(): void
    {
        $user = User::factory()->create(['email' => 'ok@example.com', 'password' => 'mon-mot-de-passe']);
        $google = (new SocialiteUser)->setRaw(['email_verified' => true])->map(['id' => 'g-2', 'name' => 'Ok', 'email' => 'ok@example.com']);
        $provider = Mockery::mock(GoogleProvider::class);
        $provider->shouldReceive('user')->andReturn($google);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/auth/google/callback');

        $this->assertTrue(Hash::check('mon-mot-de-passe', $user->fresh()->password));
    }

    public function test_unverified_user_must_verify_before_using_the_app(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)->get('/tasks')->assertRedirect(route('verification.notice'));
        $this->actingAs($user)->get('/profile')->assertOk();
    }

    public function test_registration_sends_verification_email(): void
    {
        Notification::fake();

        $this->post('/register', ['name' => 'N', 'email' => 'n@example.com', 'password' => 'password123', 'password_confirmation' => 'password123']);

        Notification::assertSentTo(User::where('email', 'n@example.com')->first(), VerifyEmail::class);
    }

    public function test_invited_email_is_verified_by_the_invitation_link(): void
    {
        $owner = User::factory()->create();
        $project = Project::create(['name' => 'P', 'color' => '#000', 'status' => 'active', 'owner_id' => $owner->id]);
        $invitation = ProjectInvitation::issue($project, $owner, 'invite@example.com', 'editor');

        $this->get(route('invitations.show', $invitation->token));
        $this->post('/register', ['name' => 'I', 'email' => 'invite@example.com', 'password' => 'password123', 'password_confirmation' => 'password123']);

        $this->assertTrue(User::where('email', 'invite@example.com')->first()->hasVerifiedEmail());
    }
}
