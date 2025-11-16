<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Secretary\AppointmentPayment;
use App\Models\Secretary\Appointment;
class AppointmentPaymentController extends Controller
{
    public function updateBothStatuses(Request $request, $id)
    {
        $appointment = Appointment::where('id', $id)->with('payments')->firstOrFail();
        $validated = $request->validate([
            'paciente' => 'required|in:pendente,pago,reembolsado',
            'seguradora' => 'required|in:pendente,pago,reembolsado',
        ]);

        foreach ($appointment->payments as $p) {
            $p->update([
                'status' => $validated[$p->payer],
                'verified_by' => auth()->id(),
            ]);
        }

        return redirect()->back()->with('success','Actualizado com sucesso');
    }
}
