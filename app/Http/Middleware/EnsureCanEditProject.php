<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bloque les modifications (et les formulaires de création/édition) pour les lecteurs du projet actif.
 */
class EnsureCanEditProject
{
    public function handle(Request $request, Closure $next): Response
    {
        $isForm = str_ends_with((string) $request->route()?->getName(), '.create') || str_ends_with((string) $request->route()?->getName(), '.edit');

        if ($request->isMethodSafe() && !$isForm) {
            return $next($request);
        }

        $project = Project::find(session('active_project_id'));
        if ($project && $request->user() && $project->isMember($request->user()) && !$project->canEdit($request->user())) {
            if ($request->isMethodSafe()) {
                return redirect()->back(fallback: route('projects.dashboard', $project))
                    ->with('error', 'Vous avez un accès en lecture seule à ce projet.');
            }

            return back()->with('error', 'Vous avez un accès en lecture seule à ce projet.');
        }

        return $next($request);
    }
}
