<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Medicines as Medicine;
use App\Models\Admin\MedicineBatches as MedicineBatch;
use Illuminate\Http\Request;
use App\Models\Admin\MedicineStockMovements as MedicineStockMovement;
use Inertia\Inertia;

class MedicineBatchController extends Controller
{
    protected $route = 'Backend/Admin/Medicines/StockBatches';
    public function index($id)
    {
        $medicine = Medicine::findOrFail($id);
        $batches = $medicine->batches()->orderBy('expiry_date')->get();
        return Inertia::render($this->route.'/Index', [
            'medicine' => $medicine,
            'batches' => $batches,
        ]);
    }
    public function create($id)
    {   
        $medicine = Medicine::findOrFail($id);
        return Inertia::render($this->route.'/Create', [
            'medicine' => $medicine
        ]);
    }
    public function store(Request $request,$id)
    {
        $validated = $request->validate([
            'batch_number' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'expiry_date' => 'required|date',
            'cost_price' => 'nullable|numeric|min:0',
        ]);
        $medicine = Medicine::findOrFail($id);

        $validated['medicine_id'] = $medicine->id;

        $batch = MedicineBatch::create($validated);

        // Criar movimento de entrada automaticamente
        MedicineStockMovement::create([
            'batch_id' => $batch->id,
            'medicine_id' => $medicine->id,
            'type' => 'in', // ou 'in'
            'quantity' => $batch->quantity,
            'note' => 'Movimento automático ao criar lote',
        ]);
        return redirect()->route('admin.medicinebatches.index', $medicine->id)
                        ->with('success', 'Lote adicionado com sucesso.');
    }

    public function edit(Request $request, $medicineId, $id)
    {
        $batch = MedicineBatch::findOrFail($id);
        $medicine = Medicine::findOrFail($medicineId);
        return Inertia::render($this->route.'/Edit', [
            'batch' => $batch,
            'medicine' => $medicine,
        ]);
    }
    public function update(Request $request, $id)
    {
        $batch = MedicineBatch::findOrFail($id);

        $validated = $request->validate([
            'batch_number' => 'nullable|string',
            'quantity' => 'required|integer|min:0',
            'expiry_date' => 'required|date',
            'cost_price' => 'nullable|numeric',
        ]);

        // Calcula diferença na quantidade
        $quantityDifference = $validated['quantity'] - $batch->quantity;

        $batch->update($validated);

        // Se houve alteração na quantidade, cria movimento de ajuste
        if ($quantityDifference !== 0) {
            MedicineStockMovement::create([
                'batch_id' => $batch->id,
                'medicine_id' => $batch->medicine_id,
                'type' => $quantityDifference > 0 ? 'in' : 'out',
                'quantity' => abs($quantityDifference),
                'note' => 'Ajuste automático ao atualizar lote',
            ]);
        }

        return back()->with('success', 'Batch atualizado com sucesso');
    }

    public function destroy($id)
    {   
        $batch = MedicineBatch::findOrFail($id);
        $batch->delete();

        return back()->with('success', 'Batch removed');
    }
}
