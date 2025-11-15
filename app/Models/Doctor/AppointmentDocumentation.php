<?php

namespace App\Models\Doctor;
use Illuminate\Database\Eloquent\Model;
use App\Models\Secretary\Appointment;
class AppointmentDocumentation extends Model
{
     protected $fillable = ['appointment_id', 'observations'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
