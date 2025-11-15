<?php

namespace App\Http\Controllers\Doctor;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\Doctor\AppointmentDocumentation;
use App\Models\Doctor\AppointmentPrescription;
use App\Models\Doctor\AppointmentAttachment;
class DocumentationController extends Controller
{
    
    protected $route = 'Backend/Doctor/Appointments/Documentation';
    
    public function documentationIndex(Request $request, $id)
    {
        $doctorId = auth()->id();
        $appointment = Appointment::with('documentation')
            ->where('id', $id)
            ->firstOrFail();
        // 1️⃣ Verifica se o médico logado é o responsável pela consulta
        if ($appointment->doctor_id !== $doctorId) {
            abort(403, 'Você não tem permissão para acessar esta documentação.');
        }

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
        return inertia($this->route . '/Index', [
            'appointment' => $appointment,
        ]);
    }
    public function editDocumentation($id)
    {
        $appointment = Appointment::findOrFail($id);
        // Se não existir documentação, criar vazio
        if (!$appointment->documentation) {
            $documentation = AppointmentDocumentation::create([
                'appointment_id' => $appointment->id,
                'observations' => '',
            ]);
            $appointment->load('documentation');
        }

        return Inertia::render($this->route . '/Edit', [
            'appointment' => $appointment,
        ]);
    }
    // ================================
    // Editar prescrição / medicamentos
    // ================================
    public function editPrescription($id)
    {
        $appointment = Appointment::findOrFail($id);

        // Se não existir prescrição, criar vazio
        if (!$appointment->prescription) {
            AppointmentPrescription::create([
                'appointment_id' => $appointment->id,
                'medications' => '',
            ]);

            // Recarrega a relação
            $appointment->load('prescription');
        }

        return Inertia::render($this->route . '/Prescription/Edit', [
            'appointment' => $appointment,
        ]);
    }
    // ================================
    // Editar anexos
    // ================================
    public function editAttachments($id)
    {
        $appointment = Appointment::findOrFail($id);
        // Anexos podem não existir, mas não é obrigatório criar registro vazio
        $appointment->load('attachments');
        return Inertia::render($this->route . '/Attachments/Edit', [
            'appointment' => $appointment,
        ]);
    }
    public function updateDocumentation(Request $request,$id)
    {
        $validated = $request->validate([
            'observations' => 'nullable|string',
        ]);
        $appointment = Appointment::findOrFail($id);
        // Cria registro se não existir
        if (!$appointment->documentation) {
            $documentation = AppointmentDocumentation::create([
                'appointment_id' => $appointment->id,
                'observations' => $validated['observations'] ?? '',
            ]);
        } else {
            $appointment->documentation->update([
                'observations' => $validated['observations'] ?? '',
            ]);
        }

        return redirect()->back()->with('success', 'Documentação atualizada com sucesso!');
    }
    // ================================
    // Atualizar prescrição / medicamentos
    // ================================
    public function updatePrescription(Request $request, $id)
    {
        $validated = $request->validate([
            'medications' => 'nullable|string',
        ]);

        $appointment = Appointment::findOrFail($id);

        // Cria registro se não existir
        if (!$appointment->prescription) {
            AppointmentPrescription::create([
                'appointment_id' => $appointment->id,
                'medications' => $validated['medications'] ?? '',
            ]);
        } else {
            // Atualiza o registro existente
            $appointment->prescription->update([
                'medications' => $validated['medications'] ?? '',
            ]);
        }

        return redirect()->back()->with('success', 'Prescrição atualizada com sucesso!');
    }

    // ================================
    // Atualizar anexos
    // ================================
    public function updateAttachments(Request $request, $id)
    {
        $validated = $request->validate([
            'attachments.*' => 'file|mimes:pdf,jpg,jpeg,png|max:2048', // até 2MB
        ]);

        $appointment = Appointment::findOrFail($id);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Pasta destino
                $destinationPath = public_path('assets/uploads/attachments');

                // Gera um nome único para o arquivo
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

                // Move o arquivo para a pasta desejada
                $file->move($destinationPath, $filename);

                // Salva no banco de dados
                AppointmentAttachment::create([
                    'appointment_id' => $appointment->id,
                    'file_path' => 'attachments/' . $filename,
                    'type' => $file->getClientOriginalExtension(),
                ]);
            }
        }
        return redirect()->back()->with('success', 'Anexos atualizados com sucesso!');
    }
    public function destroyAttachment($id)
    {
        $attachment = AppointmentAttachment::findOrFail($id);

        // Monta o caminho completo do arquivo no servidor
        $filePath = public_path('assets/uploads/' . $attachment->file_path);

        // Verifica se o arquivo existe antes de deletar
        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        $attachment->delete();

        return redirect()->back()->with('success', 'Anexo removido com sucesso!');
    }

}