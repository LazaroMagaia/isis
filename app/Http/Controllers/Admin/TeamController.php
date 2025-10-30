<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use carbon\carbon;

class TeamController extends Controller
{
    protected $route = 'Backend/Admin/Team';
    public function index(Request $request)
    {
        $query = User::query()->where('role', '!=', 'patient');

        // Filtro de pesquisa por nome, email ou phone_1
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_1', 'like', "%{$search}%");
            });
        }

        // Filtro por role
        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $team = $query->paginate(10)->withQueryString();

        return Inertia::render($this->route . '/Index', [
            'team' => $team,
            'filters' => $request->only(['search', 'role']), // envia os filtros atuais para a view
        ]);
    }
    public function create()
    {
        return Inertia::render($this->route . '/Create', []);
    }
    public function store(Request $request)
    {
        // Validação dos dados
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'role'          => ['required', Rule::in(['admin', 'doctor', 'nurse', 'secretary'])],
            'father_name'   => 'required|string|max:255',
            'mother_name'   => 'required|string|max:255',
            'gender'        => ['required', Rule::in(['male', 'female'])],
            'nationality'   => 'required|string|max:255',
            'birth_date'    => 'required|date',
            'phone_1'       => 'required|string|max:20|unique:users,phone_1', // campo que será usado como senha
        ]);

        // Criar o usuário
        $user = User::create([
            'name'    => $validated['name'],
            'email'         => $validated['email'],
            'role'          => $validated['role'],
            'father_name'   => $validated['father_name'],
            'mother_name'   => $validated['mother_name'],
            'gender'        => $validated['gender'],
            'nationality'   => $validated['nationality'],
            'birth_date'    => $validated['birth_date'],
            'password'      => Hash::make($validated['phone_1']), // senha inicial
            'phone_1'       => $validated['phone_1'], // salvar telefone se quiser
        ]);

        // Retornar resposta Inertia
        return redirect()->route('admin.team.index')
            ->with('success', 'Usuário atualizado com sucesso!');
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
            'name'         => 'required|string|max:255',
            'email'        => ['required','email', Rule::unique('users','email')->ignore($user->id)],
            'role'         => ['required', Rule::in(['admin','doctor','nurse','secretary'])],
            'father_name'  => 'required|string|max:255',
            'mother_name'  => 'required|string|max:255',
            'gender'       => ['required', Rule::in(['male','female'])],
            'nationality'  => 'required|string|max:255',
            'birth_date'   => 'required|date',
            'phone_1'      => ['required','string','max:20', Rule::unique('users','phone_1')->ignore($user->id)],
        ]);

        // Converte a data de MM-DD-YYYY (do frontend se for texto) para Y-m-d
        if ($validated['birth_date']) {
            $validated['birth_date'] = Carbon::parse($validated['birth_date'])->format('Y-m-d');
        }

        $user->update($validated);

        return redirect()->route('admin.team.index')
            ->with('success', 'Usuário atualizado com sucesso!');
    }
    public function destroy($id)
    {
        $user = User::find($id);

        if ($user) {
            $user->delete();
            return redirect()->route('admin.team.index')
                ->with('success', 'Usuário excluído com sucesso!');
        } else {
            return redirect()->route('admin.team.index')
                ->with('error', 'Usuário não encontrado.');
        }
    }

}
