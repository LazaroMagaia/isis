<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\Medicines;
use App\Models\Admin\MedicineBatches;
use App\Models\User;
use App\Models\Prescriptions;
class MedicineStockMovements extends Model
{
     protected $fillable = [
        'medicine_id',
        'batch_id',
        'type',
        'quantity',
        'user_id',
        'patient_id',
        'prescription_id',
        'notes',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicines::class);
    }

    public function batch()
    {
        return $this->belongsTo(MedicineBatches::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function prescription()
    {
        return $this->belongsTo(Prescriptions::class);
    }
}
