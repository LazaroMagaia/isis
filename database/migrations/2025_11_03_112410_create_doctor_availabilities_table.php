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
        Schema::create('doctor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->enum('type', ['weekly', 'specific_date'])->nullable()
                ->comment('Indica se a disponibilidade é semanal ou pontual');
            $table->boolean('is_active')->default(true);
            $table->integer('slot_duration')->default(30);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_availabilities');
    }
};
