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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            // atendimento relacionado
            $table->foreignId('appointment_id')
                ->nullable()
                ->constrained('appointments')
                ->cascadeOnDelete();

            // paciente
            $table->foreignId('patient_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('patient_name')->nullable();

            // secretária que fez a fatura
            $table->foreignId('secretary_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->decimal('total_amount', 10, 2)->default(0);

            // estado da fatura
            $table->enum('status', ['pending', 'paid', 'cancelled'])
                ->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
