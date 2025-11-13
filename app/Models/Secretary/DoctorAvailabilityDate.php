<?php

namespace App\Models\Secretary;

use Illuminate\Database\Eloquent\Model;

class DoctorAvailabilityDate extends Model
{
    protected $fillable=[
        'availability_id','date','start_time','end_time'
    ];
    // Cada data específica pertence a uma disponibilidade
    public function availability()
    {
        return $this->belongsTo(DoctorAvailability::class, 'availability_id');
    }
}
