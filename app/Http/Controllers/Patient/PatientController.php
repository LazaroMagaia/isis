<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Secretary\Appointment;
class PatientController extends Controller
{
    protected $route = 'Backend/Patient';
    public function index()
    {
        $user = Auth::user();

        $appointments = Appointment::where('patient_id', $user->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $totalAppointments = $appointments->sum();

        return Inertia::render($this->route.'/Index', [
            'totalAppointments' => $totalAppointments,
            'appointmentsByStatus' => $appointments,
        ]);
    }

}
