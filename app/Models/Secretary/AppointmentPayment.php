<?php

namespace App\Models\Secretary;

use Illuminate\Database\Eloquent\Model;

class AppointmentPayment extends Model
{
    protected $fillable = [
        'appointment_id',
        'amount',
        'payment_method',
        'status',
        'payer',
        'paid_at',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}