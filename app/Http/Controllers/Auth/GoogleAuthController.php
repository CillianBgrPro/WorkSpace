<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

class GoogleAuthController extends Controller
{
    /**
     * Redirige l'utilisateur vers l'écran de consentement Google.
     */
    public function redirect(): SymfonyRedirect
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Callback Google : connecte, lie ou crée le compte.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            report($e);

            return redirect()->route('login')
                ->withErrors(['email' => 'La connexion avec Google a échoué. Veuillez réessayer.']);
        }

        $email = $googleUser->getEmail();
        $emailVerified = (bool) data_get($googleUser->user, 'email_verified', false);

        if (! $email || ! $emailVerified) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Votre adresse Google doit être vérifiée pour vous connecter.']);
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (! $user) {
            $user = User::where('email', $email)->first();

            if ($user) {
                // Compte existant avec le même e-mail : on le lie à Google.
                $user->forceFill([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $user->avatar ?? $googleUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();
            } else {
                $user = User::forceCreate([
                    'name' => $googleUser->getName() ?: Str::before($email, '@'),
                    'email' => $email,
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    // Mot de passe aléatoire : l'utilisateur pourra en définir un via « Mot de passe oublié ».
                    'password' => Str::password(32),
                    'email_verified_at' => now(),
                ]);

                event(new Registered($user));
            }
        }

        Auth::login($user, remember: true);
        request()->session()->regenerate();

        return redirect()->intended(route('projects.index', absolute: false));
    }
}
