<?php

namespace App\Models\Doctor;

use Illuminate\Database\Eloquent\Model;
use App\Models\Secretary\Appointment;
class AppointmentPrescription extends Model
{
    protected $fillable = ['appointment_id', 'medications'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
