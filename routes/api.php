<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Secretary\{AppointmentController};

Route::get('/doctor/{doctor}/available-dates', [AppointmentController::class, 'availableDates'])->name('secretary.appointments.available-dates');
Route::get('/availability-date/{date}/available-slots', [AppointmentController::class, 'availableSlots'])->name('secretary.appointments.available-slots');
Route::post('/doctors-by-specialties', [AppointmentController::class, 'doctorsBySpecialties'])->name('secretary.appointments.doctors-by-specialties');
