<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Secretary\{AppointmentController};

Route::get('/doctor/{doctor}/available-dates', [AppointmentController::class, 'availableDates']);
Route::get('/availability-date/{date}/available-slots', [AppointmentController::class, 'availableSlots']);
Route::post('/doctors-by-specialties', [AppointmentController::class, 'doctorsBySpecialties']);
