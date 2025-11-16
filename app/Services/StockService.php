<?php

namespace App\Services;

use App\Models\Admin\Medicines;
use App\Models\Admin\MedicineBatches as MedicineBatch;
use App\Models\Admin\MedicineStockMovements;
use Exception;

class StockService
{
    /**
     * Remove stock using FEFO (first expiring batch first)
     */
    public function removeFromStock(Medicines $medicine, int $quantity, $userId, $patientId = null, $prescriptionId = null)
    {
        $remaining = $quantity;

        // Get batches ordered by expiry_date ASC (FEFO)
        $batches = $medicine->batches()
            ->where('quantity', '>', 0)
            ->orderBy('expiry_date', 'asc')
            ->get();

        foreach ($batches as $batch) {
            if ($remaining <= 0) break;

            $take = min($batch->quantity, $remaining);

            // Update batch quantity
            $batch->quantity -= $take;
            $batch->save();

            // Register movement
            MedicineStockMovements::create([
                'medicine_id' => $medicine->id,
                'batch_id' => $batch->id,
                'type' => 'out',
                'quantity' => $take,
                'user_id' => $userId,
                'patient_id' => $patientId,
                'prescription_id' => $prescriptionId,
            ]);

            $remaining -= $take;
        }

        if ($remaining > 0) {
            throw new Exception("Not enough stock for {$medicine->name}");
        }

        return true;
    }

    /**
     * Add stock to a specific batch
     */
    public function addStock(MedicineBatch $batch, int $quantity, $userId)
    {
        $batch->quantity += $quantity;
        $batch->save();

        MedicineStockMovements::create([
            'medicine_id' => $batch->medicine_id,
            'batch_id' => $batch->id,
            'type' => 'in',
            'quantity' => $quantity,
            'user_id' => $userId
        ]);

        return true;
    }
}
