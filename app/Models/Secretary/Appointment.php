<?php

namespace App\Models\Secretary;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\DoctorAvailabilitySlot;
use App\Models\Doctor\{AppointmentDocumentation, AppointmentPrescription, AppointmentAttachment};
class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'secretary_id',
        'service_id',
        'origin',
        'date',
        'slot_id',
        'status',
        'amount',
        'payment_status',
        'payment_method',
        'payment_verified_by',
        'notes',
        'attachments',
        'notified',
        'approved_at',
        'completed_at',
        'discount',
        'specialties',
    ];
    protected $casts = [
        'specialties' => 'array',
    ];
    // 🔹 Relacionamentos
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function secretary()
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }

    public function service()
    {
        return $this->belongsTo(\App\Models\Admin\Service::class);
    }

    public function paymentVerifier()
    {
        return $this->belongsTo(User::class, 'payment_verified_by');
    }
    public function slot()
    {
        return $this->belongsTo(DoctorAvailabilitySlot::class, 'slot_id');
    }
    public function documentation()
    {
        return $this->hasOne(AppointmentDocumentation::class);
    }

    public function prescription()
    {
        return $this->hasOne(AppointmentPrescription::class);
    }

    public function attachments()
    {
        return $this->hasMany(AppointmentAttachment::class,'appointment_id');
    }

}
