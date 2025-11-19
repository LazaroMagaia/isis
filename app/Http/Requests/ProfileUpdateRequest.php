<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'mother_name' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'nationality' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'identification_type' => ['nullable', 'string', 'max:50'],
            'identification_number' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'phone_1' => ['nullable', 'string', 'max:20'],
            'phone_2' => ['nullable', 'string', 'max:20'],
            'marital_status' => ['nullable', 'string', 'max:50'],
            'sexual_orientation' => ['nullable', 'string', 'max:50'],
            'specialties' => ['nullable', 'string'], // enviado como string separada por vírgulas
            'emergency_contact_1_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_1_address' => ['nullable', 'string', 'max:255'],
            'emergency_contact_1_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_1_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_1_fax' => ['nullable', 'string', 'max:20'],
            'emergency_contact_2_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_2_address' => ['nullable', 'string', 'max:255'],
            'emergency_contact_2_relationship' => ['nullable', 'string', 'max:50'],
            'emergency_contact_2_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_2_fax' => ['nullable', 'string', 'max:20'],
            'insurance_name' => ['nullable', 'string', 'max:255'],
            'insurance_number' => ['nullable', 'string', 'max:100'],
            'insurance_provider' => ['nullable', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }
}
