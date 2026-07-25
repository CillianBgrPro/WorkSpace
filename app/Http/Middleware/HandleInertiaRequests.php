<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $activeProject = null;

        if ($request->user() && session('active_project_id')) {
            $project = Project::find(session('active_project_id'));
            if ($project && $project->isMember($request->user())) {
                $activeProject = [
                    'id'    => $project->id,
                    'name'  => $project->name,
                    'color' => $project->color,
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'activeProject' => $activeProject,
        ];
    }
}
