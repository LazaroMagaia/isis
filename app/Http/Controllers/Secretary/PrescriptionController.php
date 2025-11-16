<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Secretary\Appointment;
use App\Models\Prescriptions as Prescription;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;   
use Illuminate\Http\Request;
class PrescriptionController extends Controller
{
    protected $route = 'Backend/Secretary/Appointment/Documentation';
    public function prescriptionStore(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        // Remover prescrições existentes
        Prescription::where('appointment_id', $appointment->id)->delete();

        // Validação
        $data = $request->validate([
            'medications.*.name' => 'required|string',
            'medications.*.dosage' => 'required|string',
            'medications.*.frequency' => 'required|string',
        ]);

        foreach ($data['medications'] as $med) {
            Prescription::create([
                'appointment_id' => $appointment->id,
                'secretary_id' => auth()->id(),
                'medication' => $med['name'],
                'dosage' => $med['dosage'],
                'frequency' => $med['frequency'],
            ]);
        }

        // Retorna para o frontend com sucesso e mensagens de validação
        return back()->with('success', 'Prescrição salva com sucesso!');
    }

    public function prescriptionPDF($id)
    {
        $appointment = Appointment::with(['patient', 'doctor'])->findOrFail($id);
        $prescriptions = $appointment->prescriptionsall()->get();

        // Sanitiza nomes para o arquivo (remove espaços e caracteres especiais)
        $patientName = preg_replace('/[^A-Za-z0-9]/', '_', $appointment->patient->name ?? 'Paciente');
        $doctorName  = preg_replace('/[^A-Za-z0-9]/', '_', $appointment->doctor->name ?? 'Medico');

        // Data e hora atual em Moçambique
        $currentDateTime = now()->setTimezone('Africa/Maputo')->format('Y-m-d_H-i-s');

        $fileName = "receita_{$currentDateTime}_{$patientName}_{$doctorName}.pdf";

        $pdf = PDF::loadView('prescriptions.pdf', [
            'appointment' => $appointment,
            'prescriptions' => $prescriptions,
        ]);

        return $pdf->download($fileName);
    }


}
