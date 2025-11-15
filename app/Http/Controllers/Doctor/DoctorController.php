<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
class DoctorController extends Controller
{
    protected $route = 'Backend/Doctor';
    public function index()
    {
          $doctorId = auth()->id(); // médico logado

        $consultasPendentes = Appointment::where('doctor_id', $doctorId)
            ->whereDate('date', '>=', Carbon::today())
            ->whereNotIn('status', ['cancelado', 'concluido'])
            ->count();
        return Inertia::render($this->route.'/Index', [
            'consultasPendentes' => $consultasPendentes,
        ]);
    }
    public function appointments(Request $request)
    {
        $doctorId = auth()->id();
        $today = now()->startOfDay();

        // ======================
        // 📊 ESTATÍSTICAS (apenas datas a partir de hoje)
        // ======================
        $baseQuery = Appointment::where('doctor_id', $doctorId)
                                ->whereDate('date', '>=', $today);

        $stats = [
            'total'      => (clone $baseQuery)->count(),
            'pendentes'  => (clone $baseQuery)->whereIn('status', ['solicitado', 'aguardando_pagamento'])->count(),
            'aprovadas'  => (clone $baseQuery)->where('status', 'aprovado')->count(),
            'concluidas' => (clone $baseQuery)->where('status', 'concluido')->count(),
        ];

        // ======================
        // 📅 CONSULTAS – LISTAGEM
        // ======================
        $query = (clone $baseQuery)->with(['patient', 'service', 'slot'])
                    ->orderBy('date', 'desc')
                    ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', fn($p) => $p->where('name', 'like', "%$search%"))
                ->orWhereHas('service', fn($s) => $s->where('name', 'like', "%$search%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->paginate(10)->withQueryString();
        
        return inertia($this->route . '/Appointments/Index', [
            'appointments' => $appointments,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
            'stats' => $stats,
        ]);
    }
   


}
