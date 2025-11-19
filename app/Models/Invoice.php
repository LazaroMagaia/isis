<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Secretary\Appointment as Appointments;
use App\Models\InvoiceItem;
use App\Models\User;
class Invoice extends Model
{
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'secretary_id',
        'total_amount',
        'status','number',
        'notes','patient_name'
    ];
    protected static function booted()
    {
        static::creating(function ($invoice) {
            $next = Invoice::max('id') + 1;
            $invoice->number = str_pad($next, 6, '0', STR_PAD_LEFT);
        });
    }
    public function appointment()
    {
        return $this->belongsTo(Appointments::class);
    }
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
    public function secretary()
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }
    public function items()
    {
        return $this->hasMany(InvoiceItem::class, 'invoice_id');
    }
}