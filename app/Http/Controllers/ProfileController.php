<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{   
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Determina a rota de edição de perfil baseado no role
        $routeName = match ($user->role) {
            'admin' => 'admin.profile.edit',
            'doctor' => 'doctor.profile.edit',
            'nurse' => 'nurse.profile.edit',
            'secretary' => 'secretary.profile.edit',
            'patient' => 'patient.profile.edit',
            default => 'profile.edit',
        };

        return Inertia::render('Backend/Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $user,
            'editRoute' => $routeName, // rota dinâmica para o front-end
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Prepara os dados validados
        $data = $request->validated();

        // Converte specialties de string para array JSON
        if (isset($data['specialties'])) {
            // Remove espaços extras e transforma em array
            $specialtiesArray = array_filter(array_map('trim', explode(',', $data['specialties'])));
            // Converte em JSON
            $data['specialties'] = json_encode($specialtiesArray);
        }

        $user->fill($data);
        // Reseta verificação de email se alterado
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()->back()->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
