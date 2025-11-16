<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Secretary\Appointment;
class Prescriptions extends Model
{
    protected $fillable = [
        'appointment_id',
        'secretary_id',
        'medication',
        'dosage',
        'frequency',
    ];
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function secretary()
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }
}