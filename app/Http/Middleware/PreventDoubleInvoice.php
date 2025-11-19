<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Invoice;
class PreventDoubleInvoice
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
   public function handle($request, Closure $next)
    {
        $appointmentId = $request->route('appointmentId');

        $exists = Invoice::where('appointment_id', $appointmentId)->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Esta consulta já foi faturada.');
        }

        return $next($request);
    }

}
