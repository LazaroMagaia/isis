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
            'prescriptionsall', // relacionamento "hasMany" com AppointmentPrescription
            'prescription',    // relacionamento "hasOne" com AppointmentPrescription
            'attachments',
        ])
        ->whereHas('documentation')
        ->findOrFail($id);

        // Preenche medicamentos existentes
        $existingMedications = $appointment->prescriptionsall->map(function ($p) {
            return [
                'name' => $p->medication,
                'dosage' => $p->dosage,
                'frequency' => $p->frequency,
            ];
        });
        //dd($existingMedications);
        // Lista de medicamentos fictícia para o select
        $recommendedMedications = [
            'Paracetamol',
            'Ibuprofeno',
            'Amoxicilina',
            'Metformina',
            'Omeprazol',
        ];

        return inertia($this->route . '/PrescriptionGenerate', [
            'appointment' => $appointment,
            'existingMedications' => $existingMedications,
            'availableMedications' => $recommendedMedications, // ✅ envio para o frontend
        ]);
    }

}
