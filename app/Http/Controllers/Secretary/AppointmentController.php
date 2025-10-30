<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
use App\Models\Admin\Service;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    protected $route = 'Backend/Secretary/Appointment';
    public function index()
    {
        $search = request()->get('search', '');
        $status = request()->get('status', '');

        $appointments = Appointment::with(['patient', 'doctor', 'service'])
            ->when($search, function ($query, $search) {
                $query->whereHas('patient', fn($q) => $q->where('name', 'like', "%$search%"))
                    ->orWhereHas('doctor', fn($q) => $q->where('name', 'like', "%$search%"))
                    ->orWhereHas('service', fn($q) => $q->where('name', 'like', "%$search%"));
            })
            ->when($status, fn($query) => $query->where('status', $status))
            ->when(!$status, fn($query) => $query->where('status', '!=', 'cancelado')) // 🔹 padrão: não mostrar cancelados
            ->latest()
            ->paginate(10)
            ->withQueryString(); // mantém os filtros na paginação
        $stats = [
            'approved' => Appointment::where('status', 'aprovado')->count(),
            'cancelled' => Appointment::where('status', 'cancelado')->count(),
            'pending' => Appointment::whereIn('status', ['solicitado', 'aguardando_pagamento'])->count(),
            'completed' => Appointment::where('status', 'concluido')->count(),
        ];
        return Inertia::render($this->route . '/Index', [
            'appointments' => $appointments,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'stats' => $stats,
            ],
        ]);
    }

    public function create()
    {
        $services = Service::all();
        $patients = User::where('role', 'patient')->get();
        $doctors = User::where('role', 'doctor')->get();
        return Inertia::render($this->route . '/Create',
        [
            'services' => $services,
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }
    /**
     * Armazena um novo agendamento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:users,id',
            'doctor_id' => 'nullable|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'origin' => 'required|in:online,presencial,medico',
            'date' => 'required|date',
            'time' => 'required',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'payment_method' => 'nullable|string|max:100',
        ]);

        // 🔹 Busca o serviço para calcular valores
        $service = Service::findOrFail($validated['service_id']);
        $amount = $service->price ?? 0;
        $discount = $validated['discount'] ?? 0;

        // 🔹 Calcula o valor final
        $finalAmount = max($amount - $discount, 0);
        $status = null;
        if($validated['payment_method'] == 'dinheiro')
        {
            $status = 'aprovado';
        }
        // 🔹 Cria o agendamento
        $appointment = Appointment::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'] ?? null,
            'secretary_id' => Auth::id(), // quem está criando
            'service_id' => $validated['service_id'],
            'origin' => $validated['origin'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'discount' => $discount,
            'amount' => $finalAmount,
            'payment_method' => $validated['payment_method'] ?? null,
            'status' => $status ?? 'solicitado',
            'payment_status' => 'pendente',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Agendamento atualizado com sucesso!');
    }
    public function edit($id)
    {
        $appointment = Appointment::find($id);
        $services = Service::all();
        $patients = User::where('role', 'patient')->get();
        $doctors = User::where('role', 'doctor')->get();
        return Inertia::render($this->route . '/Edit', [
            'appointment' => $appointment,
            'services' => $services,
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }
    /**
     * Atualiza um agendamento existente
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $validated = $request->validate([
            'doctor_id' => 'nullable|exists:users,id',
            'patient_id' => 'required|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
            'date' => 'nullable|date',
            'time' => 'nullable',
            'status' => 'nullable|in:solicitado,aguardando_pagamento,aprovado,cancelado,concluido',
            'discount' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|in:pendente,pago,reembolsado',
            'payment_method' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        // 🔹 Atualiza valores e recalcula preço se necessário
        if (isset($validated['service_id'])) {
            $service = Service::findOrFail($validated['service_id']);
            $amount = $service->price ?? $appointment->amount;
        } else {
            $amount = $appointment->amount;
        }

        $discount = $validated['discount'] ?? $appointment->discount;
        $finalAmount = max($amount - $discount, 0);

        // 🔹 Atualiza status especiais
        if (($validated['status'] ?? null) === 'aprovado' && !$appointment->approved_at) {
            $validated['approved_at'] = now();
        }
        if (($validated['status'] ?? null) === 'concluido' && !$appointment->completed_at) {
            $validated['completed_at'] = now();
        }

        $appointment->update(array_merge($validated, [
            'amount' => $finalAmount,
        ]));

        return redirect()->back()->with('success', 'Agendamento atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $appointment = Appointment::findorFail($id);
        // Só altera o status
        $appointment->status = 'cancelado';
        $appointment->save();

        return redirect()->back()->with('success', 'Agendamento cancelado com sucesso!');
    }
}
