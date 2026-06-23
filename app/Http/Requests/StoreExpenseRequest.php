<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'budget_id' => ['required', 'exists:budgets,id'],
            'category_id' => ['required', 'exists:budget_categories,id'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'receipt_url' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
