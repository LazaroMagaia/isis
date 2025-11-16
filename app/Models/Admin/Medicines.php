<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\MedicineBatches;
use App\Models\Admin\MedicineStockMovements;
use App\Models\Admin\Medicinecategories;
class Medicines extends Model
{
    protected $fillable = [
        'name',
        'form',
        'dosage',
        'unit',
        'category_id'
    ];

    public function batches()
    {
        return $this->hasMany(MedicineBatches::class, 'medicine_id'); // <--- correção
    }

    public function movements()
    {
        return $this->hasMany(MedicineStockMovements::class);
    }
    public function category()
    {
        return $this->belongsTo(Medicinecategories::class, 'category_id');
    }

    // Stock total (somando lotes)
    public function getTotalStockAttribute()
    {
        return $this->batches->sum('quantity');
    }
}
