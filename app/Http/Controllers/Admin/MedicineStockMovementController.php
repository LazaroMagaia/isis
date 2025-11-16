<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Medicines as Medicine;
use App\Models\Admin\MedicineBatches as MedicineBatch;
use App\Models\Admin\MedicineStockMovements as MedicineStockMovement;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineStockMovementController extends Controller
{
    public function index()
    {
        return Inertia::render('MedicineStock/Index', [
            'movements' => MedicineStockMovement::with(['medicine', 'batch', 'user'])
                ->orderBy('created_at', 'desc')
                ->paginate(20)
        ]);
    }

    public function addStock(Request $request, MedicineBatch $batch, StockService $service)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $service->addStock($batch, $validated['quantity'], auth()->id());

        return back()->with('success', 'Stock added successfully');
    }
}
