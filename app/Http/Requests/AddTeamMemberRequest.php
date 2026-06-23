<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in(['admin', 'chef_projet', 'collaborateur'])],
        ];
    }
}
