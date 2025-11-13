<?php

namespace App\Models\Secretary;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class DoctorAvailability extends Model
{
    protected $fillable = [
        'doctor_id',
        'slot_duration',
        'is_active',
        'type'
    ];

    // Cada disponibilidade pertence a um médico
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Disponibilidade semanal (dias)
    public function days()
    {
        return $this->hasMany(DoctorAvailabilityDay::class, 'availability_id');
    }

    // Disponibilidade pontual (datas)
    public function dates()
    {
        return $this->hasMany(DoctorAvailabilityDate::class, 'availability_id');
    }

    // Slots combinados (dias + datas) — opcional, se quiser usar 'slots'
    public function getSlotsAttribute()
    {
        $slots = [];

        // Dias semanais
        foreach ($this->days as $day) {
            $slots[] = [
                'type' => 'weekly',
                'day' => $day->day,
                'start_time' => $day->start_time,
                'end_time' => $day->end_time,
            ];
        }

        // Datas específicas
        foreach ($this->dates as $date) {
            $slots[] = [
                'type' => 'specific_date',
                'date' => $date->date,
                'start_time' => $date->start_time,
                'end_time' => $date->end_time,
            ];
        }

        return $slots;
    }
}
