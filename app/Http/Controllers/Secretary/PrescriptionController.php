<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Secretary\Appointment;
use App\Models\Prescriptions as Prescription;
use Barryvdh\DomPDF\Facade\Pdf;   
use Illuminate\Http\Request;
use App\Models\Admin\Medicines;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\MedicineBatches;
use App\Models\Admin\MedicineStockMovements;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
class PrescriptionController extends Controller
{
    protected $route = 'Backend/Secretary/Appointment/Documentation';
    public function prescriptionStore(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $data = $request->validate([
            'medications' => 'required|array',
            'medications.*.medicine_id' => 'nullable|integer|exists:medicines,id',
            'medications.*.batch_id' => 'nullable|integer',
            'medications.*.name' => 'nullable|string',
            'medications.*.dosage' => 'nullable|string',
            'medications.*.frequency' => 'required|string',
            'medications.*.quantity' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($appointment, $data) {

            // Remove prescrições antigas do appointment
            $oldPrescriptions = Prescription::where('appointment_id', $appointment->id)->get();
            foreach ($oldPrescriptions as $old) {
                // opcional: reestornar stock ao lote
                if ($old->batch_id && $old->medicine_id) {
                    $batch = MedicineBatches::find($old->batch_id);
                    if ($batch) {
                        $batch->quantity += $old->quantity;
                        $batch->save();
                    }
                }
                $old->delete();
            }

            foreach ($data['medications'] as $i => $med) {
                $medicineId = $med['medicine_id'] ?? null;
                $requestedQty = (int) ($med['quantity'] ?? 0);
                $chosenBatchId = $med['batch_id'] ?? null;

                $medicationName = $med['name'] ?? null;
                if ($medicineId) {
                    $medicine = Medicines::find($medicineId);
                    $medicationName = $medicine ? $medicine->name : $medicationName;
                }

                $remaining = $requestedQty;
                $firstConsumedBatchId = null;

                // Se é medicamento manual (sem medicine_id)
                if (!$medicineId) {
                    Prescription::create([
                        'appointment_id' => $appointment->id,
                        'secretary_id' => auth()->id(),
                        'medicine_id' => null,
                        'medication' => $medicationName,
                        'dosage' => $med['dosage'] ?? null,
                        'frequency' => $med['frequency'],
                        'quantity' => $requestedQty,
                        'batch_id' => null,
                    ]);
                    continue;
                }

                // Verifica estoque total
                $totalStock = MedicineBatches::where('medicine_id', $medicineId)->sum('quantity');
                if ($totalStock < $requestedQty) {
                    throw ValidationException::withMessages([
                        "medications.{$i}.quantity" => ["Stock insuficiente (disponível: {$totalStock})."]
                    ]);
                }

                // Primeiro consome do batch escolhido, se houver
                if ($chosenBatchId) {
                    $batch = MedicineBatches::where('id', $chosenBatchId)
                        ->where('medicine_id', $medicineId)
                        ->lockForUpdate()
                        ->first();

                    if ($batch && $batch->quantity > 0) {
                        $take = min($batch->quantity, $remaining);
                        $batch->quantity -= $take;
                        $batch->save();

                        MedicineStockMovements::create([
                            'medicine_id' => $medicineId,
                            'batch_id' => $batch->id,
                            'type' => 'out',
                            'quantity' => $take,
                            'user_id' => auth()->id(),
                            'patient_id' => $appointment->patient_id,
                            'prescription_id' => null,
                            'notes' => 'Consumo prescrição (batch escolhido)',
                        ]);

                        $remaining -= $take;
                        $firstConsumedBatchId = $batch->id;
                    }
                }

                // Se ainda resta, consome FIFO
                if ($remaining > 0) {
                    $batches = MedicineBatches::where('medicine_id', $medicineId)
                        ->where('quantity', '>', 0)
                        ->orderBy('expiry_date', 'asc')
                        ->orderBy('id', 'asc')
                        ->lockForUpdate()
                        ->get();

                    foreach ($batches as $b) {
                        if ($remaining <= 0) break;

                        $take = min($b->quantity, $remaining);
                        $b->quantity -= $take;
                        $b->save();

                        MedicineStockMovements::create([
                            'medicine_id' => $medicineId,
                            'batch_id' => $b->id,
                            'type' => 'out',
                            'quantity' => $take,
                            'user_id' => auth()->id(),
                            'patient_id' => $appointment->patient_id,
                            'prescription_id' => null,
                            'notes' => 'Consumo prescrição (FIFO)',
                        ]);

                        if (!$firstConsumedBatchId) $firstConsumedBatchId = $b->id;

                        $remaining -= $take;
                    }
                }

                if ($remaining > 0) {
                    throw ValidationException::withMessages([
                        "medications.{$i}.quantity" => ["Não foi possível alocar {$remaining} unidades do medicamento."]
                    ]);
                }

                // Cria a prescrição
                $prescription = Prescription::create([
                    'appointment_id' => $appointment->id,
                    'secretary_id' => auth()->id(),
                    'medicine_id' => $medicineId,
                    'medication' => $medicationName,
                    'dosage' => $med['dosage'] ?? null,
                    'frequency' => $med['frequency'],
                    'quantity' => $requestedQty,
                    'batch_id' => $firstConsumedBatchId,
                ]);

                // Atualiza prescription_id nos movimentos
                MedicineStockMovements::where('medicine_id', $medicineId)
                    ->where('user_id', auth()->id())
                    ->where('type', 'out')
                    ->whereNull('prescription_id')
                    ->orderByDesc('created_at')
                    ->limit($requestedQty)
                    ->update(['prescription_id' => $prescription->id]);
            }
        });

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
    
    public function prescriptionInvoice(Request $request, $appointmentId)
    {
        $appointment = Appointment::with('patient')->findOrFail($appointmentId);
        $prescriptions = Prescription::where('appointment_id', $appointmentId)->get();

        if ($prescriptions->isEmpty()) {
            return back()->with('error', 'Não existem prescrições para faturar.');
        }

        $invoiceId = null;

        DB::transaction(function () use ($appointment, $prescriptions, &$invoiceId) {

            // Busca fatura existente ou cria nova
            $invoice = Invoice::firstOrCreate(
                ['appointment_id' => $appointment->id],
                [
                    'patient_id' => $appointment->patient_id,
                    'secretary_id' => auth()->id(),
                    'total_amount' => 0,
                    'status' => 'paid',
                    'notes' => null,
                ]
            );

            $invoiceId = $invoice->id;

            // Remove items antigos da fatura
            $oldItems = InvoiceItem::where('invoice_id', $invoice->id)->get();
            foreach ($oldItems as $item) {
                if ($item->medicine_id && $item->quantity > 0) {
                    // Reverte estoque dos lotes
                    $batch = MedicineBatches::find($item->batch_id);
                    if ($batch) {
                        $batch->quantity += $item->quantity;
                        $batch->save();

                        MedicineStockMovements::create([
                            'medicine_id' => $item->medicine_id,
                            'batch_id' => $item->batch_id,
                            'type' => 'in',
                            'quantity' => $item->quantity,
                            'user_id' => auth()->id(),
                            'patient_id' => $appointment->patient_id,
                            'prescription_id' => $item->prescription_id,
                            'notes' => 'Ajuste de fatura: devolução de estoque',
                        ]);
                    }
                }
            }
            InvoiceItem::where('invoice_id', $invoice->id)->delete();

            $total = 0;

            foreach ($prescriptions as $presc) {

                // Medicamento manual
                if (!$presc->medicine_id) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'medicine_id' => null,
                        'batch_id' => null,
                        'prescription_id' => $presc->id,
                        'quantity' => $presc->quantity,
                        'unit_price' => 0,
                        'total_price' => 0,
                    ]);
                    continue;
                }

                $medicineId = $presc->medicine_id;
                $remaining = $presc->quantity;
                $itemTotal = 0;

                // Aloca lotes disponíveis (FIFO)
                $batches = MedicineBatches::where('medicine_id', $medicineId)
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date', 'asc')
                    ->lockForUpdate()
                    ->get();

                foreach ($batches as $batch) {
                    if ($remaining <= 0) break;

                    $take = min($remaining, (int)$batch->quantity);

                    // cria movimento de saída
                    MedicineStockMovements::create([
                        'medicine_id' => $medicineId,
                        'batch_id' => $batch->id,
                        'type' => 'out',
                        'quantity' => $take,
                        'user_id' => auth()->id(),
                        'patient_id' => $appointment->patient_id,
                        'prescription_id' => $presc->id,
                        'notes' => 'Consumo no faturamento (FIFO)',
                    ]);

                    $batch->quantity -= $take;
                    $batch->save();

                    $unitPrice = $batch->cost_price;

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'medicine_id' => $medicineId,
                        'batch_id' => $batch->id,
                        'prescription_id' => $presc->id,
                        'quantity' => $take,
                        'unit_price' => $unitPrice,
                        'total_price' => $unitPrice * $take,
                    ]);

                    $itemTotal += $unitPrice * $take;
                    $remaining -= $take;
                }

                if ($remaining > 0) {
                    throw ValidationException::withMessages([
                        "medicine_{$medicineId}" => [
                            "Stock insuficiente para faturar o medicamento {$presc->medication}."
                        ]
                    ]);
                }

                $total += $itemTotal;
            }

            $invoice->total_amount = $total;
            $invoice->save();
        });

        return back()->with('success', 'Fatura criada/atualizada com sucesso! ID da Fatura: ' . $invoiceId);
    }
    
    public function prescriptionInvoiceDownload($appointmentId)
    {
        $appointment = Appointment::with('patient')->findOrFail($appointmentId);

        // busca a fatura existente
        $invoice = Invoice::where('appointment_id', $appointmentId)->first();

        if (!$invoice) {
            return back()->with('error', 'Não existe fatura para esta receita.');
        }

        // carrega relações necessárias
        $invoice->load('items.prescription', 'items.medicine', 'items.batch', 'patient');

        // atualiza unit_price e total_price baseado no custo do lote, se não estiver preenchido
        foreach ($invoice->items as $item) {
            if ($item->medicine_id && $item->batch) {
                $item->unit_price = $item->batch->cost_price;
                $item->total_price = $item->unit_price * $item->quantity;
            } else {
                $item->unit_price = $item->unit_price ?? 0;
                $item->total_price = $item->total_price ?? 0;
            }
        }

        // atualiza total geral da fatura
        $invoice->total_amount = $invoice->items->sum('total_price');

        // número da fatura
        $invoiceNumber = $invoice->number ?? str_pad($invoice->id, 6, '0', STR_PAD_LEFT);

        // usa created_at da fatura como data/hora de emissão
        $dateTime = $invoice->created_at->format('d/m/Y H:i');

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'appointment' => $appointment,
            'invoiceNumber' => $invoiceNumber,
            'dateTime' => $dateTime,
        ]);

        $fileName = "fatura-{$invoiceNumber}_consulta-{$appointmentId}_" . $invoice->created_at->format('Ymd_His') . ".pdf";

        return $pdf->download($fileName);
    }



}
