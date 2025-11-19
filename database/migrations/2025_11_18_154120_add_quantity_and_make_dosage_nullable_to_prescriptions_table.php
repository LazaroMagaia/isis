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
        Schema::table('prescriptions', function (Blueprint $table) {
            // Torna dosage nullable
            $table->string('dosage')->nullable()->change();
            // Adiciona quantity
            $table->unsignedInteger('quantity')->default(0)->after('frequency');
            $table->foreignId('medicine_id')->nullable()->constrained('medicines')->nullOnDelete()->after('secretary_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            if (Schema::hasColumn('prescriptions', 'quantity')) {
                $table->dropColumn('quantity');
            }

            // remove foreign key + medicine_id
            if (Schema::hasColumn('prescriptions', 'medicine_id')) {
                $table->dropConstrainedForeignId('medicine_id');
            }

            // volta dosage para NOT NULL (caso queira)
            // note: change() exige doctrine/dbal
            $table->string('dosage')->nullable(false)->change();
        });
    }
};
