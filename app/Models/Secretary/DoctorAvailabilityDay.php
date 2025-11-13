<?php

namespace App\Models\Secretary;

use Illuminate\Database\Eloquent\Model;

class DoctorAvailabilityDay extends Model
{
    protected $fillable=[
        'availability_id','day','start_time','end_time'
    ];
    // Cada data específica pertence a uma disponibilidade
    public function availability()
    {
        return $this->belongsTo(DoctorAvailability::class, 'availability_id');
    }
}
