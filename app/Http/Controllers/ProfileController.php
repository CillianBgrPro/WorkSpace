<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Budget;
use App\Models\Event;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'status'        => session('status'),
            'hasPassword'   => (bool) $user->has_password,
            'hasGoogle'     => (bool) $user->google_id,
            'preferences'   => [
                'theme'               => $user->theme ?? 'system',
                'email_notifications' => (bool) $user->email_notifications,
            ],
            'calendarUrl'   => $user->calendar_token ? route('calendar.feed', $user->calendar_token) : null,
            'ownedProjects' => Project::where('owner_id', $user->id)->pluck('name'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('success', 'Profil mis à jour.');
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'theme'               => ['sometimes', 'in:light,dark,system'],
            'email_notifications' => ['sometimes', 'boolean'],
        ]);

        $request->user()->forceFill($data)->save();

        return back()->with('success', 'Préférences enregistrées.');
    }

    /** (Re)génère le lien d'abonnement iCal personnel. L'ancien lien cesse de fonctionner. */
    public function regenerateCalendarToken(Request $request): RedirectResponse
    {
        $request->user()->forceFill(['calendar_token' => Str::random(48)])->save();

        return back()->with('success', "Lien d'abonnement généré.");
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Compte Google sans mot de passe : confirmation par saisie de l'e-mail.
        if ($user->has_password) {
            $request->validate(['password' => ['required', 'current_password']]);
        } else {
            $request->validate(['confirmation' => ['required', 'in:' . $user->email]], [
                'confirmation.in' => 'Saisissez exactement votre adresse e-mail pour confirmer.',
            ]);
        }

        // Déconnexion AVANT la suppression : logout() régénère le jeton « se souvenir de moi »
        // et ré-enregistrerait sinon l'utilisateur qu'on vient de supprimer.
        Auth::logout();

        DB::transaction(function () use ($user) {
            // Ce que la personne a créé dans les projets des autres reste au projet :
            // on le rattache au propriétaire au lieu de le supprimer en cascade.
            $foreign = Project::where('owner_id', '!=', $user->id)->pluck('owner_id', 'id');
            foreach ([Task::class, Budget::class, Event::class, ProjectFile::class] as $model) {
                $model::where('user_id', $user->id)
                    ->whereIn('project_id', $foreign->keys())
                    ->get()
                    ->each(fn ($item) => $item->forceFill(['user_id' => $foreign[$item->project_id]])->saveQuietly());
            }
            Task::where('assignee_id', $user->id)->update(['assignee_id' => null]);

            $user->delete();
        });

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
