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
        // MySQL permite alterar enum com MODIFY
        DB::statement("
            ALTER TABLE appointments 
            MODIFY payment_status ENUM('pendente', 'pago', 'reembolsado', 'parcial') 
            DEFAULT 'pendente'
        ");
    }

    public function down(): void
    {
        // Reverter para o enum original
        DB::statement("
            ALTER TABLE appointments 
            MODIFY payment_status ENUM('pendente', 'pago', 'reembolsado') 
            DEFAULT 'pendente'
        ");
    }
};
