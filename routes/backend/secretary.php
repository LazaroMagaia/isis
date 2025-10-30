<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Secretary\{SecretaryController,UsersController,AppointmentController};

Route::prefix('secretary')
    ->name('secretary.')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('/', [SecretaryController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

        //Team
        Route::get('/patient', [UsersController::class, 'index'])->name('patient.index');
        Route::get('/patient/create', [UsersController::class, 'create'])->name('patient.create');
        Route::post('/patient', [UsersController::class, 'store'])->name('patient.store');
        Route::get('/patient/{patient}', [UsersController::class, 'show'])->name('patient.show');
        Route::get('/patient/{patient}/edit', [UsersController::class, 'edit'])->name('patient.edit');
        Route::put('/patient/{patient}', [UsersController::class, 'update'])->name('patient.update');
        Route::delete('/patient/{patient}', [UsersController::class, 'destroy'])->name('patient.destroy');

        //Schedule
        Route::get('/appointment', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/appointment/create', [AppointmentController::class, 'create'])->name('appointments.create');
        Route::post('/appointment', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::get('/appointment/{schedule}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::get('/appointment/{schedule}/edit', [AppointmentController::class, 'edit'])->name('appointments.edit');
        Route::put('/appointment/{schedule}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('/appointment/{schedule}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
    });
