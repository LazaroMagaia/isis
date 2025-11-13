<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Mail\UserCreatedMail;
use Illuminate\Support\Facades\Mail;
class UsersController extends Controller
{
    protected $route = 'Backend/Secretary/Patient';

    public function index(Request $request)
    {
        $query = User::query()->where('role', 'patient');

        // Filtro de pesquisa por nome, email ou phone_1
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('id', 'like', "%{$search}%")
                    ->orWhere('phone_1', 'like', "%{$search}%");
            });
        }

        // Filtro por role
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $team = $query->paginate(10)->withQueryString();

        return Inertia::render($this->route . '/Index', [
            'user' => $team,
            'filters' => $request->only(['search', 'role']), // envia os filtros atuais para a view
        ]);
    }
    public function create()
    {
        return Inertia::render($this->route . '/Create', []);
    }
    public function store(Request $request)
    {
        // Validação de todos os campos importantes (os obrigatórios)
        $validated = $request->validate([
            // STEP 1 - Conta & Básicos
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',

            // STEP 2 - Pessoais
            'gender'      => ['required', Rule::in(['male', 'female', 'other'])],
            'birth_date'  => 'required|date',
            'nationality' => 'required|string|max:255',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',

            // STEP 3 - Identificação
            'identification_type'   => 'nullable|string|max:255',
            'identification_number' => 'nullable|string|max:255',

            // STEP 4 - Endereço & Contato
            'address'   => 'nullable|string|max:255',
            'province'  => 'nullable|string|max:255',
            'phone_1'   => 'nullable|string|max:20|unique:users,phone_1',
            'phone_2'   => 'nullable|string|max:20',

            // STEP 5 - Detalhes Pessoais
            'marital_status'      => 'nullable|string|max:255',
            'sexual_orientation'  => 'nullable|string|max:255',

            // STEP 6 & 7 - Contatos de Emergência
            'emergency_contact_1_name'        => 'nullable|string|max:255',
            'emergency_contact_1_relationship'=> 'nullable|string|max:255',
            'emergency_contact_1_phone'       => 'nullable|string|max:20',
            'emergency_contact_1_address'     => 'nullable|string|max:255',
            'emergency_contact_1_fax'         => 'nullable|string|max:20',

            'emergency_contact_2_name'        => 'nullable|string|max:255',
            'emergency_contact_2_relationship'=> 'nullable|string|max:255',
            'emergency_contact_2_phone'       => 'nullable|string|max:20',
            'emergency_contact_2_address'     => 'nullable|string|max:255',
            'emergency_contact_2_fax'         => 'nullable|string|max:20',

            // STEP 8 - Seguro
            'insurance_name'      => 'nullable|string|max:255',
            'insurance_number'    => 'nullable|string|max:255',
            'insurance_provider'  => 'nullable|string|max:255',
        ]);

        // Cria o usuário
        $user = User::create([
            'role'          => 'patient',
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make('12345'),
            'father_name'   => $validated['father_name'] ?? null,
            'mother_name'   => $validated['mother_name'] ?? null,
            'gender'        => $validated['gender'],
            'nationality'   => $validated['nationality'],
            'birth_date'    => $validated['birth_date'],
            'identification_type'   => $validated['identification_type'] ?? null,
            'identification_number' => $validated['identification_number'] ?? null,
            'address'       => $validated['address'] ?? null,
            'province'      => $validated['province'] ?? null,
            'phone_1'       => $validated['phone_1'] ?? null,
            'phone_2'       => $validated['phone_2'] ?? null,
            'marital_status'=> $validated['marital_status'] ?? null,
            'sexual_orientation'=> $validated['sexual_orientation'] ?? null,
            'emergency_contact_1_name'        => $validated['emergency_contact_1_name'] ?? null,
            'emergency_contact_1_relationship'=> $validated['emergency_contact_1_relationship'] ?? null,
            'emergency_contact_1_phone'       => $validated['emergency_contact_1_phone'] ?? null,
            'emergency_contact_1_address'     => $validated['emergency_contact_1_address'] ?? null,
            'emergency_contact_1_fax'         => $validated['emergency_contact_1_fax'] ?? null,
            'emergency_contact_2_name'        => $validated['emergency_contact_2_name'] ?? null,
            'emergency_contact_2_relationship'=> $validated['emergency_contact_2_relationship'] ?? null,
            'emergency_contact_2_phone'       => $validated['emergency_contact_2_phone'] ?? null,
            'emergency_contact_2_address'     => $validated['emergency_contact_2_address'] ?? null,
            'emergency_contact_2_fax'         => $validated['emergency_contact_2_fax'] ?? null,
            'insurance_name'      => $validated['insurance_name'] ?? null,
            'insurance_number'    => $validated['insurance_number'] ?? null,
            'insurance_provider'  => $validated['insurance_provider'] ?? null,
        ]);
        // Envia o e-mail
        Mail::to($user->email)->send(new UserCreatedMail($user, '12345'));
        return redirect()->route('secretary.patient.index')
            ->with('success', 'Paciente criado com sucesso!');
    }
    public function edit($id)
    {
        $user = User::find($id);

        // Não precisa alterar o formato para input type=date
        // Apenas garantir que está no formato correto
        if ($user && $user->birth_date) {
            $user->birth_date = $user->birth_date->format('Y-m-d'); // yyyy-mm-dd
        }

        return Inertia::render($this->route . '/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            // Conta & Básicos
            'name'        => 'required|string|max:255',
            'email'       => ['required','email', Rule::unique('users','email')->ignore($user->id)],
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',

            // Pessoais
            'gender'           => ['required', Rule::in(['male','female','other'])],
            'nationality'      => 'required|string|max:255',
            'birth_date'       => 'required|date',

            // Identificação
            'identification_type'   => ['nullable', Rule::in(['BI','Passport','Carta de conducao'])],
            'identification_number' => 'nullable|string|max:255',

            // Endereço & Contato
            'address'   => 'nullable|string|max:255',
            'province'  => 'nullable|string|max:255',
            'phone_1'   => ['required','string','max:20', Rule::unique('users','phone_1')->ignore($user->id)],
            'phone_2'   => 'nullable|string|max:20',

            // Detalhes Pessoais
            'marital_status'      => ['nullable', Rule::in(['solteiro','casado','divorciado','viuvo','outro'])],
            'sexual_orientation'  => ['nullable', Rule::in(['heterossexual','homossexual','bissexual','pansexual','assexual','outro'])],

            // Emergência 1
            'emergency_contact_1_name'         => 'nullable|string|max:255',
            'emergency_contact_1_relationship' => ['nullable', Rule::in(['pai','mae','irmao','tio','conjuge','filho','amigo','outro'])],
            'emergency_contact_1_phone'        => 'nullable|string|max:20',
            'emergency_contact_1_address'      => 'nullable|string|max:255',
            'emergency_contact_1_fax'          => 'nullable|string|max:20',

            // Emergência 2
            'emergency_contact_2_name'         => 'nullable|string|max:255',
            'emergency_contact_2_relationship' => ['nullable', Rule::in(['pai','mae','irmao','tio','conjuge','filho','amigo','outro'])],
            'emergency_contact_2_phone'        => 'nullable|string|max:20',
            'emergency_contact_2_address'      => 'nullable|string|max:255',
            'emergency_contact_2_fax'          => 'nullable|string|max:20',

            // Seguro
            'insurance_name'     => 'nullable|string|max:255',
            'insurance_number'   => 'nullable|string|max:255',
            'insurance_provider' => 'nullable|string|max:255',
        ]);

        // Conversão de data para Y-m-d caso venha em outro formato
        if (!empty($validated['birth_date'])) {
            $validated['birth_date'] = Carbon::parse($validated['birth_date'])->format('Y-m-d');
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Usuário atualizado com sucesso!');
    }
    public function destroy($id)
    {
        $user = User::find($id);

        if ($user) {
            $user->delete();
            return redirect()->back()
                ->with('success', 'Usuário excluído com sucesso!');
        } else {
            return redirect()->back()
                ->with('error', 'Usuário não encontrado.');
        }
    }

}
