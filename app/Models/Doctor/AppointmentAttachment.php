<?php

namespace App\Models\Doctor;

use Illuminate\Database\Eloquent\Model;
use App\Models\Secretary\Appointment;
class AppointmentAttachment extends Model
{
    protected $fillable = ['appointment_id', 'file_path', 'type'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
