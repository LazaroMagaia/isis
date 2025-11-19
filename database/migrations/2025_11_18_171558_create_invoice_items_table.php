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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
                // fatura
            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();

            // medicamento
            $table->foreignId('medicine_id')
                ->nullable()
                ->constrained('medicines')
                ->nullOnDelete();

            // lote usado
            $table->foreignId('batch_id')
                ->nullable()
                ->constrained('medicine_batches')
                ->nullOnDelete();

            // vínculo com a prescrição
            $table->foreignId('prescription_id')
                ->nullable()
                ->constrained('prescriptions')
                ->nullOnDelete();

            // dados financeiros
            $table->integer('quantity')->default(1);

            // preço unitário — se quiser faturar por medicamento
            $table->decimal('unit_price', 10, 2)->default(0);

            $table->decimal('total_price', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
