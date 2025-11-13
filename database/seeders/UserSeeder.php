<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'role' => 'admin',
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'phone_1' => '840000001',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'role' => 'doctor',
            'name' => 'John Doe',
            'email' => 'doctor@example.com',
            'phone_1' => '840000002',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'role' => 'nurse',
            'name' => 'Maria Silva',
            'email' => 'nurse@example.com',
            'phone_1' => '840000003',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'role' => 'secretary',
            'name' => 'Carlos Matos',
            'email' => 'secretary@example.com',
            'phone_1' => '840000004',
            'password' => Hash::make('password123'),
        ]);

        User::create([
            'role' => 'patient',
            'name' => 'Ana Pereira',
            'email' => 'patient@example.com',
            'phone_1' => '840000005',
            'patient_id'=>'250001',
            'password' => Hash::make('password123'),
        ]);
    }
}
