<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Secretary\Appointment;
use Inertia\Inertia;

class SecretaryController extends Controller
{
    protected $route = 'Backend/Secretary';
    public function index()
    {
        // Contagens por status
        $stats = [
            'approved' => Appointment::where('status', 'aprovado')->count(),
            'cancelled' => Appointment::where('status', 'cancelado')->count(),
            'pending' => Appointment::whereIn('status', ['solicitado', 'aguardando_pagamento'])->count(),
            'completed' => Appointment::where('status', 'concluido')->count(),
        ];
        return Inertia::render($this->route . '/Index',[
            'stats' => $stats,
        ]);
    }
}
