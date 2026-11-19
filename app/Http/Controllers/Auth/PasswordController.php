<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        // Un compte créé via Google n'a pas de mot de passe connu : il peut en définir un directement.
        $hasPassword = (bool) $request->user()->has_password;

        $validated = $request->validate([
            'current_password' => $hasPassword ? ['required', 'current_password'] : ['nullable'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Le champ mot de passe actuel est obligatoire.',
            'current_password.current_password' => 'Le mot de passe actuel est incorrect.',
            'password.required' => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        $request->user()->forceFill([
            'password'     => Hash::make($validated['password']),
            'has_password' => true,
        ])->save();

        return back()->with('success', $hasPassword ? 'Mot de passe modifié.' : 'Mot de passe défini : vous pouvez aussi vous connecter avec votre e-mail.');
    }
}
