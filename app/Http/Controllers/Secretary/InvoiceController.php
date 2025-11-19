<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Admin\Medicines as Medicine;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Admin\Medicines;
use App\Models\Admin\MedicineBatches;
use App\Models\Admin\MedicineStockMovements;
use Barryvdh\DomPDF\Facade\Pdf;
class InvoiceController extends Controller
{
    protected $route = 'Backend/Secretary/Invoices';
    public function index(Request $request)
    {
        $query = Invoice::query()
            ->with(['patient', 'items.batch', 'items.medicine'])
            ->orderBy('created_at', 'desc');

        // Filtra por status passado ou, por padrão, não mostrar canceladas
        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', '!=', 'cancelled'); // padrão: ocultar canceladas
        }

        if ($request->search) {
            $query->whereHas('patient', fn($q) => $q->where('name', 'like', "%{$request->search}%"))
                ->orWhere('number', 'like', "%{$request->search}%");
        }

        if ($request->date_start) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->date_end) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $invoices = $query->paginate(10)->withQueryString();

        return Inertia::render($this->route.'/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'status', 'date_start', 'date_end']),
        ]);
    }
    public function show($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->load(['patient', 'items.batch', 'items.medicine']);

        return Inertia::render($this->route.'/Show', [
            'invoice' => $invoice,
        ]);
    }
    public function create()
    {
        // Pacientes
        $patients = User::where('role', 'patient')->get();

        // 1) Obter saldo real de cada batch (movements)
        $batchBalances = DB::table('medicine_stock_movements')
            ->select('batch_id', DB::raw("
                SUM(
                    CASE 
                        WHEN type = 'in' THEN quantity 
                        WHEN type = 'out' THEN -quantity 
                        ELSE 0 
                    END
                ) as balance
            "))
            ->groupBy('batch_id')
            ->pluck('balance', 'batch_id');  // [batch_id => saldo]

        // 2) Carregar medicamentos com batches e calcular stock real total
        $medicines = Medicine::with(['category', 'batches'])->get()->map(function ($medicine) use ($batchBalances) {

            // Processar batches com saldo real
            $batches = $medicine->batches->map(function ($b) use ($batchBalances) {
                $balance = (int) ($batchBalances[$b->id] ?? 0);
                return [
                    'id' => $b->id,
                    'batch_number' => $b->batch_number,
                    'quantity' => $balance,
                    'expiry_date' => $b->expiry_date ? $b->expiry_date->toDateString() : null,
                    'cost_price' => $b->cost_price,
                ];
            })
            ->filter(fn($b) => $b['quantity'] > 0) // manter só lotes com stock
            ->sortBy(fn($b) => $b['expiry_date'] ?? '9999-12-31')
            ->values()
            ->all();

            // Total real
            $totalStock = array_sum(array_column($batches, 'quantity'));

            return [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'form' => $medicine->form,
                'unit' => $medicine->unit,
                'category' => $medicine->category?->name,
                'total_stock' => $totalStock,
                'batches' => $batches,
            ];
        })
        ->values()
        ->all();

        return Inertia::render($this->route.'/Create', [
            'patients' => $patients,
            'medicines' => $medicines,
        ]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => ['nullable', 'exists:users,id'],
            'patient_name' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['nullable', 'exists:medicines,id'],
            'items.*.batch_id' => ['nullable', 'exists:medicine_batches,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.total_price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($request, &$invoice) {
            // Cria fatura
            $invoice = Invoice::create([
                'patient_id' => $request->patient_id ?: null, // se não houver, cliente externo
                'patient_name' => $request->patient_id ? null : $request->patient_name,
                'secretary_id' => auth()->id(),
                'total_amount' => 0,
                'status' => 'paid',
                'notes' => $request->notes,
            ]);

            $totalAmount = 0;

            foreach ($request->items as $item) {
                $medicineId = $item['medicine_id'] ?? null;
                $batchId = $item['batch_id'] ?? null;
                $quantity = $item['quantity'];
                $unitPrice = $item['unit_price'];
                $totalPrice = $item['total_price'];

                if ($medicineId && $batchId) {
                    $batch = MedicineBatches::lockForUpdate()->findOrFail($batchId);

                    if ($batch->quantity < $quantity) {
                        throw ValidationException::withMessages([
                            'items' => ["Estoque insuficiente para o lote {$batch->batch_number}."]
                        ]);
                    }

                    // desconta estoque
                    $batch->quantity -= $quantity;
                    $batch->save();

                    // registra movimento
                    MedicineStockMovements::create([
                        'medicine_id' => $medicineId,
                        'batch_id' => $batchId,
                        'type' => 'out',
                        'quantity' => $quantity,
                        'user_id' => auth()->id(),
                        'patient_id' => $request->patient_id,
                        'notes' => 'Saída no faturamento',
                    ]);
                }

                // cria item da fatura
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'medicine_id' => $medicineId,
                    'batch_id' => $batchId,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);

                $totalAmount += $totalPrice;
            }

            $invoice->total_amount = $totalAmount;
            $invoice->save();
        });

        return redirect()->route('secretary.invoices.index')
            ->with('success', 'Fatura criada com sucesso! ID:');
    }
    public function destroy($id)
    {
        $invoice = Invoice::with('items')->findOrFail($id);

        // Só é possível cancelar faturas pagas
        if ($invoice->status !== 'paid') {
            return redirect()->back()->with('error', 'Somente faturas pagas podem ser canceladas.');
        }

        DB::transaction(function () use ($invoice) {
            // Reverte estoque
            foreach ($invoice->items as $item) {
                if ($item->batch_id && $item->quantity > 0) {
                    $batch = MedicineBatches::lockForUpdate()->find($item->batch_id);
                    if ($batch) {
                        $batch->quantity += $item->quantity;
                        $batch->save();

                        MedicineStockMovements::create([
                            'medicine_id' => $item->medicine_id,
                            'batch_id' => $item->batch_id,
                            'type' => 'in',
                            'quantity' => $item->quantity,
                            'user_id' => auth()->id(),
                            'patient_id' => $invoice->patient_id,
                            'notes' => 'Reversão por cancelamento de fatura',
                        ]);
                    }
                }
            }

            // Altera status da fatura
            $invoice->status = 'cancelled';
            $invoice->save();
        });

        return redirect()->route('secretary.invoices.index')
            ->with('success', "Fatura #{$invoice->number} cancelada com sucesso.");
    }
    public function pdf($id, Request $request)
    {
        $invoice = Invoice::with(['patient', 'secretary', 'items.batch', 'items.medicine'])->findOrFail($id);

        // Determina o tipo de destinatário ('patient' ou 'secretary') enviado do select
        $recipientType =$request->type ?? 'patient';
        // Define o nome do destinatário
        $recipient = $recipientType === 'patient'
            ? ($invoice->patient->name ?? $invoice->patient_name ?? '—')
            : ($invoice->secretary->name ?? '—');

        // Define se deve mostrar o lote
        if ($recipientType =='patient') {
            $showBatch = false;
        } else {
            $showBatch = true; // padrão mostrar lote
        }

        $pdf = Pdf::loadView('pdf.secretary-invoice', [
            'invoice' => $invoice,
            'recipient' => $recipient,
            'showBatch' => $showBatch
        ])->setPaper('A4');

        $createdDate = $invoice->created_at->format('Ymd_His'); // YYYYMMDD_HHMMSS
        return $pdf->stream("fatura_{$invoice->number}_{$createdDate}.pdf");
    }


}