<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ServiceCategoryTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Reprodução Assistida', 'description' => 'FIV, ICSI, inseminação artificial'],
            ['name' => 'Ecografia', 'description' => 'Exames de imagem obstétricos e ginecológicos'],
            ['name' => 'Consultas Médicas', 'description' => 'Atendimento clínico e acompanhamento gestacional'],
            ['name' => 'Cirurgias', 'description' => 'Procedimentos cirúrgicos e endoscópicos'],
            ['name' => 'Serviços Digitais', 'description' => 'Aplicativos e vídeos do pré-natal'],
        ];

        foreach ($categories as $category) {
            DB::table('service_categories')->insert([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
