<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorAvailabilitySlot extends Model
{
    protected $fillable = [
        'availability_date_id',
        'start_time',
        'end_time',
        'is_booked',
    ];
}
