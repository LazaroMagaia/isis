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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();

            // 🔹 Quem é o paciente
            $table->foreignId('patient_id')
                ->constrained('users')
                ->onDelete('cascade');

            // 🔹 Médico responsável
            $table->foreignId('doctor_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // 🔹 Secretaria que criou/gerencia
            $table->foreignId('secretary_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // 🔹 Serviço vinculado (ex: FIV, Ecografia 3D, etc)
            $table->foreignId('service_id')
                ->nullable()
                ->constrained('services')
                ->onDelete('set null');

            // 🔹 Origem do agendamento
            $table->enum('origin', ['online', 'presencial', 'medico'])
                ->default('online')
                ->comment('Origem da solicitação: site, secretaria ou indicação médica');

            // 🔹 Datas e horários
            $table->date('date'); // dia da consulta
            $table->time('time'); // hora
            $table->dateTime('approved_at')->nullable(); // quando foi aprovada
            $table->dateTime('completed_at')->nullable(); // quando foi concluída

            // 🔹 Status do agendamento
            $table->enum('status', [
                'solicitado',
                'aguardando_pagamento',
                'aprovado',
                'cancelado',
                'concluido',
            ])->default('solicitado');

            // 🔹 Dados financeiros
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('amount', 10, 2)->nullable();
            $table->enum('payment_status', ['pendente', 'pago', 'reembolsado'])
                ->default('pendente');
            $table->string('payment_method')->nullable(); // ex: POS, transferência
            $table->foreignId('payment_verified_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            // 🔹 Informações adicionais
            $table->text('notes')->nullable(); // observações do médico ou secretaria
            $table->text('attachments')->nullable(); // relatórios, ecografias, etc (JSON)
            $table->boolean('notified')->default(false); // se notificações foram enviadas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
