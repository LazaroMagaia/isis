<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
use App\Models\Admin\Service;
use Illuminate\Support\Facades\Auth;
use App\Models\DoctorAvailabilitySlot;
use App\Models\Secretary\DoctorAvailabilityDate;
use Illuminate\Validation\Rule;
use Illuminate\Support\Carbon;
class AppointmentController extends Controller
{
    protected $route = 'Backend/Secretary/Appointment';
    public function index()
    {
        $search = request()->get('search', '');
        $status = request()->get('status', '');
        $doctor_id = request()->get('doctor_id', '');

        // Lista de médicos para o select
        $doctors = User::where('role', 'doctor')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Query base
        $baseQuery = Appointment::with(['patient', 'doctor', 'service','slot','payments'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('patient', fn($p) => $p->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('doctor', fn($d) => $d->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('service', fn($s) => $s->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($doctor_id, fn($q) => $q->where('doctor_id', $doctor_id)); // 👈 FILTRO POR MÉDICO

        // Total
        $totalAppointment = (clone $baseQuery)->count();

        // Paginação
        $appointments = (clone $baseQuery)
            ->when($status, fn($query) => $query->where('status', $status))
            ->when(!$status, fn($query) => $query->where('status', '!=', 'cancelado'))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Estatísticas
        $stats = [
            'approved'  => (clone $baseQuery)->where('status', 'aprovado')->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelado')->count(),
            'pending'   => (clone $baseQuery)->whereIn('status', ['solicitado', 'aguardando_pagamento'])->count(),
            'completed' => (clone $baseQuery)->where('status', 'concluido')->count(),
        ];

        return Inertia::render($this->route . '/Index', [
            'appointments' => $appointments,
            'totalAppointment' => $totalAppointment,
            'doctors' => $doctors, // 👈 ENVIA PARA O FRONT
            'filters' => [
                'search' => $search,
                'status' => $status,
                'doctor_id' => $doctor_id, // 👈 MANTÉM SELECIONADO NO FRONT
                'stats' => $stats,
            ],
        ]);
    }
    // Retorna datas disponíveis de um médico
    public function availableDates($doctorId)
    {
        $dates = DoctorAvailabilityDate::whereHas('availability', function($q) use ($doctorId) {
                $q->where('doctor_id', $doctorId)
                ->where('is_active', true)
                ->where('type', 'specific_date');
            })
            ->where('date', '>=', Carbon::today()) // Filtra datas futuras ou hoje
            ->orderBy('date')
            ->get(['id', 'date']);

        return response()->json($dates);
    }

    // Retorna slots livres de uma data específica
    public function availableSlots($dateId)
    {
        $slots = DoctorAvailabilitySlot::where('availability_date_id', $dateId)
            ->where('is_booked', false)
            ->orderBy('start_time')
            ->get(['id', 'start_time', 'end_time','is_booked']);
        return response()->json($slots);
    }
    public function doctorsBySpecialties(Request $request)
    {
        $specialties = $request->input('specialties', []);
        
        $doctors = User::where('role', 'doctor')
            ->whereJsonContains('specialties', $specialties)
            ->get(['id', 'name']);
        
        return response()->json($doctors);
    }
    public function create()
    {
        $services = Service::all();
        $patients = User::where('role', 'patient')->get();
        
        // Buscar todos os médicos
        $doctors = User::where('role', 'doctor')->get();

        // Extrair todas as especialidades únicas dos médicos
        $allSpecialties = User::where('role', 'doctor')
            ->pluck('specialties')             // pega todas as colunas JSON
            ->map(fn($s) => json_decode($s))   // transforma string JSON em array
            ->flatten()                         // transforma arrays de arrays em 1 array só
            ->unique()                          // remove duplicados
            ->values();                         // reindexa
        return Inertia::render($this->route . '/Create', [
            'services' => $services,
            'patients' => $patients,
            'doctors' => $doctors,
            'specialties' => $allSpecialties, // envia para o frontend
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
            'slot_id' => [
                'required',
                'exists:doctor_availability_slots,id',
                Rule::unique('appointments')->where(function ($query) use ($request) {
                    return $query->where('date', $request->date);
                }),
            ],
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'payment_method' => 'required|string|max:100',
            'paid_amount' => 'nullable|numeric|min:0',
        ], [
            'slot_id.unique' => 'Este horário já está reservado para a data selecionada.',
        ]);

        $slot = DoctorAvailabilitySlot::findOrFail($validated['slot_id']);
        $service = Service::findOrFail($validated['service_id']);
        $amount = $service->price ?? 0;
        $discount = $validated['discount'] ?? 0;

        $finalAmount = max($amount - ($amount * $discount / 100), 0);

        $paymentStatus = 'pendente';
        $status = 'solicitado';

        if ($validated['payment_method'] === 'dinheiro') {
            $paymentStatus = 'pago';
            $status = 'aprovado';
        } elseif ($validated['payment_method'] === 'parcial') {
            $paymentStatus = 'parcial';
        }

        $appointment = Appointment::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $validated['doctor_id'] ?? null,
            'secretary_id' => auth()->id(),
            'service_id' => $validated['service_id'],
            'origin' => $validated['origin'],
            'date' => $validated['date'],
            'discount' => $discount,
            'amount' => $finalAmount,
            'payment_method' => $validated['payment_method'],
            'payment_status' => $paymentStatus,
            'status' => $status,
            'notes' => $validated['notes'] ?? null,
            'slot_id' => $validated['slot_id'],
        ]);

        // marca slot como reservado
        $slot->update(['is_booked' => true]);

        // Se pagamento parcial, cria os dois registros
        if ($validated['payment_method'] === 'parcial') {

            $paidByPatient = floatval($validated['paid_amount'] ?? 0);
            $total = floatval($finalAmount);

            // Valor pago pelo paciente (limitado ao total)
            $patientAmount = min($paidByPatient, $total);

            // Valor pago pela seguradora
            $insuranceAmount = max($total - $patientAmount, 0);

            // 🔹 Registro do paciente
            $appointment->payments()->create([
                'amount' => $patientAmount,
                'payer' => 'paciente',
                'payment_method' => $validated['payment_method'] ?? null,
                'status' => 'pendente',
                'verified_by' => null,
            ]);

            // 🔹 Registro da seguradora
            $appointment->payments()->create([
                'amount' => $insuranceAmount,
                'payer' => 'seguradora',
                'payment_method' => null, // seguradora não escolhe método aqui
                'status' => 'pendente',
                'verified_by' => null,
            ]);
        }


        return redirect()->back()->with('success', 'Agendamento criado com sucesso!');
    }
    public function edit($id)
    {
        $appointment = Appointment::with(['patient', 'doctor', 'service','slot','payments'])->findOrFail($id);

        $services = Service::all();
        $patients = User::where('role', 'patient')->get();
        $doctors = User::where('role', 'doctor')->get();

        // Extrair todas as especialidades únicas dos médicos
        $allSpecialties = User::where('role', 'doctor')
            ->pluck('specialties')             // pega todas as colunas JSON
            ->map(fn($s) => json_decode($s))   // transforma string JSON em array
            ->flatten()                         // transforma arrays de arrays em 1 array só
            ->unique()                          // remove duplicados
            ->values();                         // reindexa
        return Inertia::render($this->route . '/Edit', [
            'appointment'   => $appointment,
            'services'      => $services,
            'patients'      => $patients,
            'doctors'       => $doctors,
            'specialties'   => $allSpecialties, // ✅ adiciona especialidades
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
            'origin' => 'nullable|in:online,presencial,medico',
            'date' => 'nullable|date',
            'slot_id' => 'nullable|exists:doctor_availability_slots,id',
            'status' => 'nullable|in:solicitado,aguardando_pagamento,aprovado,cancelado,concluido',
            'discount' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|in:pendente,pago,parcial,reembolsado',
            'payment_method' => 'nullable|string|max:100',
            'paid_amount' => 'nullable|numeric|min:0', // pago pelo paciente se parcial
            'notes' => 'nullable|string',
        ]);

        // valida slot se data mudou
        if (isset($validated['date']) && $validated['date'] != $appointment->date && empty($validated['slot_id'])) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['slot_id' => 'A hora é obrigatória quando a data é alterada.']);
        }

        // recalcula valor
        $amount = isset($validated['service_id']) 
            ? (Service::findOrFail($validated['service_id'])->price ?? $appointment->amount) 
            : $appointment->amount;

        $discount = $validated['discount'] ?? $appointment->discount;
        $finalAmount = max($amount - ($amount * $discount / 100), 0);

        // Atualiza slot se necessário
        if (isset($validated['slot_id']) && $validated['slot_id'] != $appointment->slot_id) {
            if ($appointment->slot_id) {
                $oldSlot = DoctorAvailabilitySlot::find($appointment->slot_id);
                if ($oldSlot) $oldSlot->update(['is_booked' => false]);
            }
            $newSlot = DoctorAvailabilitySlot::findOrFail($validated['slot_id']);
            $newSlot->update(['is_booked' => true]);
        } else {
            unset($validated['slot_id']);
        }

        // status especiais
        if (($validated['status'] ?? null) === 'aprovado' && !$appointment->approved_at) {
            $validated['approved_at'] = now();
        }
        if (($validated['status'] ?? null) === 'concluido' && !$appointment->completed_at) {
            $validated['completed_at'] = now();
        }

        // Atualiza o agendamento
        $appointment->update(array_merge($validated, [
            'amount' => $finalAmount,
        ]));

        // Atualiza pagamento parcial
        if (($validated['payment_method'] ?? null) === 'parcial' && isset($validated['paid_amount'])) {

            // 🔹 Valor pago pelo paciente (limitado ao valor final)
            $patientAmount = min($validated['paid_amount'], $finalAmount);

            // 🔹 Valor pago pela seguradora (restante)
            $insuranceAmount = max($finalAmount - $patientAmount, 0);

            /*
            |--------------------------------------------------------------------------
            | 1) Registrar / atualizar pagamento do PACIENTE
            |--------------------------------------------------------------------------
            */
            $appointment->payments()->updateOrCreate(
                ['payer' => 'paciente'], // condição
                [
                    'amount' => $patientAmount,
                    'method' => 'patient',
                    'paid_by' => 'patient',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 2) Registrar / atualizar pagamento da SEGURADORA
            |--------------------------------------------------------------------------
            */
            $appointment->payments()->updateOrCreate(
                ['payer' => 'seguradora'], // condição
                [
                    'amount' => $insuranceAmount,
                    'method' => 'insurance',
                    'paid_by' => 'insurance',
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | 3) Atualiza o status do pagamento
            |--------------------------------------------------------------------------
            */
            $appointment->update(['payment_status' => 'parcial']);
        }


        return redirect()->back()->with('success', 'Agendamento atualizado com sucesso!');
    }

    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);

        // 🔹 Libera o slot reservado, se existir
        if ($appointment->slot_id) {
            $slot = DoctorAvailabilitySlot::find($appointment->slot_id);
            if ($slot) {
                $slot->update(['is_booked' => false]);
            }
        }

        // 🔹 Atualiza o status do agendamento
        $appointment->update(['status' => 'cancelado']);

        return redirect()->back()->with('success', 'Agendamento cancelado com sucesso!');
    }

}
