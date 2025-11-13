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
        Schema::table('appointments', function (Blueprint $table) {
            // Adiciona referência ao slot do médico
            $table->foreignId('slot_id')
                ->nullable()
                ->constrained('doctor_availability_slots')
                ->onDelete('set null');
            
            // Opcional: se quiser remover a coluna antiga 'time'
            $table->dropColumn('time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Recria a coluna 'time'
            $table->string('time')->nullable();

            // Remove a foreign key slot_id
            $table->dropForeign(['slot_id']);
            $table->dropColumn('slot_id');
        });
    }
};
