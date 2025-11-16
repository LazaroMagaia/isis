<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Secretary\Appointment;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        // Role
        'role',

        // Basic information
        'patient_id',
        'name',
        'father_name',
        'mother_name',
        'gender',
        'nationality',
        'birth_date',

        // Identification
        'identification_type',
        'identification_number',

        // Address
        'address',
        'province',

        // Contact
        'phone_1',
        'phone_2',

        // Personal details
        'marital_status',
        'sexual_orientation',

        // Emergency contacts
        'emergency_contact_1_name',
        'emergency_contact_1_address',
        'emergency_contact_1_relationship',
        'emergency_contact_1_phone',
        'emergency_contact_1_fax',

        'emergency_contact_2_name',
        'emergency_contact_2_address',
        'emergency_contact_2_relationship',
        'emergency_contact_2_phone',
        'emergency_contact_2_fax',

        // Insurance
        'insurance_name',
        'insurance_number',
        'insurance_provider',

        // Authentication
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'password' => 'hashed',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if ($user->role === 'patient') {
                $user->patient_id = self::generatePatientId();
            }
        });
    }
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id')  // para médicos
            ->orWhere('patient_id', $this->id);               // para pacientes
    }

    public function doctorAppointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function patientAppointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }


    /**
     * Gera o código de paciente (patient_id) com base no ano e sequência.
     *
     * Exemplo: 250001 → primeiro paciente do ano de 2025
     */
    public static function generatePatientId()
    {
        $year = now()->format('y'); // últimos dois dígitos do ano

        // Conta quantos pacientes foram criados neste ano
        $count = self::where('role', 'patient')
            ->whereYear('created_at', now()->year)
            ->count() + 1;

        // Adiciona zeros à esquerda (ex: 0001)
        $sequence = str_pad($count, 4, '0', STR_PAD_LEFT);

        return "{$year}{$sequence}";
    }

}
