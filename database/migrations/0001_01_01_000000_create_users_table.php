<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
        public function up(): void
        {
            Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Role / user type
            $table->enum('role', ['admin', 'doctor', 'nurse', 'secretary', 'patient'])->default('patient');

            // Basic information
            $table->string('name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('nationality')->nullable();
            $table->date('birth_date')->nullable();

            // Identification
            $table->string('identification_type')->nullable(); // BI, Passport, etc.
            $table->string('identification_number')->nullable();

            // Address
            $table->string('address')->nullable();
            $table->string('province')->nullable();

            // Contact
            $table->string('phone_1')->nullable();
            $table->string('phone_2')->nullable();

            // Personal details
            $table->string('marital_status')->nullable(); // single, married, divorced, etc.
            $table->string('sexual_orientation')->nullable();

            // Emergency contacts
            $table->string('emergency_contact_1_name')->nullable();
            $table->string('emergency_contact_1_address')->nullable();
            $table->string('emergency_contact_1_relationship')->nullable();
            $table->string('emergency_contact_1_phone')->nullable();
            $table->string('emergency_contact_1_fax')->nullable();

            $table->string('emergency_contact_2_name')->nullable();
            $table->string('emergency_contact_2_address')->nullable();
            $table->string('emergency_contact_2_relationship')->nullable();
            $table->string('emergency_contact_2_phone')->nullable();
            $table->string('emergency_contact_2_fax')->nullable();

            // Insurance
            $table->string('insurance_name')->nullable(); // insurance company name
            $table->string('insurance_number')->nullable(); // insurance card/policy number
            $table->string('insurance_provider')->nullable(); // insurance provider name

            // Authentication
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            $table->timestamps();
        });


        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
