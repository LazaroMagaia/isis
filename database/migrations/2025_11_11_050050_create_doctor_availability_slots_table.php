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
        Schema::create('doctor_availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('availability_date_id')
                ->constrained('doctor_availability_dates')
                ->onDelete('cascade'); // cascata se a data for removida
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_booked')->default(false); // se o slot já foi reservado
            $table->unique(['availability_date_id', 'start_time', 'end_time'], 'unique_slot_per_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_availability_slots');
    }
};
