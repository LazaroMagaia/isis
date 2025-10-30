<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AdminController extends Controller
{
    protected $route = 'Backend/Admin';
    public function index()
    {
        return Inertia::render($this->route . '/Index');
    }
    public function patient(Request $request)
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
        return Inertia::render($this->route . '/Patient/Index',[
            'user' => $team,
            'filters' => $request->only(['search', 'role']), // envia os filtros atuais para a view
        ]);
    }
}
