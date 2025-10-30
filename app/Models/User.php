<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
}
