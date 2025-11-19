<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\Doctor\AppointmentDocumentation;
use App\Models\Doctor\AppointmentPrescription;
use App\Models\Doctor\AppointmentAttachment;
use App\Models\User;
use App\Models\Admin\Medicines;
use Illuminate\Support\Facades\DB;
class DocumentationController extends Controller
{
    protected $route = 'Backend/Secretary/Appointment/Documentation';
    public function index(Request $request)
    {
        $doctorIds  = $request->doctor_ids ?? [];
        $patientIds = $request->patient_ids ?? [];

        // =============================
        // 🔥 APENAS MÉDICOS COM DOCUMENTAÇÃO
        // =============================
        $doctors = User::where('role', 'doctor')
            ->whereHas('doctorAppointments.documentation') // <<< AJUSTADO
            ->select('id', 'name')
            ->get();

        // =============================
        // 🔥 APENAS PACIENTES COM DOCUMENTAÇÃO
        // =============================
        $patients = User::where('role', 'patient')
            ->whereHas('patientAppointments.documentation') // <<< AJUSTADO
            ->select('id', 'name')
            ->get();

        // ============================
        // 🔍 FILTRO PRINCIPAL
        // ============================
        $query = Appointment::query()
            ->with(['patient', 'doctor', 'service', 'slot'])
            ->whereHas('documentation')
            ->orderBy('date', 'desc');

        if (!empty($doctorIds)) {
            $query->whereIn('doctor_id', $doctorIds);
        }

        if (!empty($patientIds)) {
            $query->whereIn('patient_id', $patientIds);
        }

        $appointments = $query->paginate(12)->withQueryString();

        return inertia($this->route . '/Index', [
            'appointments' => $appointments,
            'doctors'      => $doctors,
            'patients'     => $patients,
            'filters'      => [
                'doctor_ids'  => $doctorIds,
                'patient_ids' => $patientIds,
            ]
        ]);
    }
    public function documentationShow(Request $request, $id)
    {
        $appointment = Appointment::with('documentation')
            ->where('id', $id)
            ->firstOrFail();
    
        // 2️⃣ Verifica se a consulta está aprovada
        if ($appointment->status !== 'aprovado') {
            abort(403, 'A documentação só pode ser feita para consultas aprovadas.');
        }

        // 3️⃣ Carrega dados relacionados, mesmo que vazios
        $appointment->load([
            'patient',
            'service',
            'slot',
            'documentation',          // documento da consulta
            'prescription',          // prescriptions do Appointment
            'attachments',            // attachments do Appointment
        ]);
        // 4️⃣ Retorna para Inertia
        return inertia($this->route . '/Show', [
            'appointment' => $appointment,
        ]);
    }
    public function prescriptionGenerate(int $id)
    {
        $appointment = Appointment::with([
            'patient',
            'doctor',
            'service',
            'slot',
            'documentation',
            'prescriptionsall',
            'prescription',
            'attachments',
        ])
        ->whereHas('documentation')
        ->findOrFail($id);

        // Existing prescriptions
        $existingMedications = $appointment->prescriptionsall->map(function ($p) {
            return [
                'id' => $p->id,
                'medicine_id' => $p->medicine_id ?? null,
                'batch_id' => $p->batch_id ?? null,
                'name' => $p->medicine_id ? null : $p->medication,
                'medication_label' => $p->medication,
                'dosage' => $p->dosage,
                'frequency' => $p->frequency,
                'quantity' => (int) ($p->quantity ?? 0),
            ];
        })->values()->all();

        // Calcula saldo real por lote usando stock movements
        $batchBalances = DB::table('medicine_stock_movements')
            ->select('batch_id', DB::raw("SUM(CASE WHEN type='in' THEN quantity WHEN type='out' THEN -quantity ELSE 0 END) as balance"))
            ->whereNotNull('batch_id')
            ->groupBy('batch_id')
            ->pluck('balance', 'batch_id'); // [batch_id => saldo]

        // Disponíveis: medicamentos com lotes válidos (saldo > 0)
        $availableMedications = Medicines::with(['category', 'batches'])->get()->map(function ($medicine) use ($batchBalances) {
            $batches = $medicine->batches->map(function ($b) use ($batchBalances) {
                $balance = (int) ($batchBalances[$b->id] ?? 0);
                return [
                    'id' => $b->id,
                    'batch_number' => $b->batch_number,
                    'quantity' => $balance,
                    'expiry_date' => $b->expiry_date?->toDateString(),
                    'cost_price' => $b->cost_price,
                ];
            })
            ->filter(fn($b) => $b['quantity'] > 0) // filtra lotes sem estoque
            ->sortBy(fn($b) => $b['expiry_date'] ?? '9999-12-31') // FIFO
            ->values()
            ->all();

            $totalStock = array_sum(array_column($batches, 'quantity'));
            $firstBatch = count($batches) ? $batches[0] : null;

            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'form' => $medicine->form,
                'unit' => $medicine->unit,
                'category' => $medicine->category?->name,
                'total_stock' => $totalStock, // estoque total real
                'batches' => $batches,
                'first_batch' => $firstBatch,
            ];
        })
        ->values()
        ->all();
        return inertia($this->route . '/PrescriptionGenerate', [
            'appointment' => $appointment,
            'existingMedications' => $existingMedications,
            'availableMedications' => $availableMedications,
        ]);
    }

}
