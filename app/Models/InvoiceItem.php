<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Invoice;
use App\Models\Prescriptions;
class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'medicine_id',
        'batch_id',
        'prescription_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function medicine()
    {
        return $this->belongsTo(\App\Models\Admin\Medicines::class, 'medicine_id');
    }

    public function batch()
    {
        return $this->belongsTo(\App\Models\Admin\MedicineBatches::class, 'batch_id');
    }

    public function prescription()
    {
        return $this->belongsTo(Prescriptions::class, 'prescription_id');
    }
}
