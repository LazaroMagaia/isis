<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\Medicines;
use App\Models\Admin\MedicineStockMovements;
use App\Models\Admin\MedicineBatches as MedicineBatch;
class MedicineBatches extends Model
{
    
    protected $fillable = [
        'medicine_id',
        'batch_number',
        'quantity',
        'expiry_date',
        'cost_price',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicines::class);
    }

    public function movements()
    {
        return $this->hasMany(MedicineStockMovements::class, 'batch_id');
    }
    public function batch() {
        return $this->belongsTo(MedicineBatch::class);
    }
}
