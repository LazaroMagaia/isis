<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Doctor\{DoctorController,DocumentationController};

Route::prefix('doctor')
    ->name('doctor.')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('/', [DoctorController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        //Agendamentos
        Route::get('/appointments', [DoctorController::class, 'appointments'])->name('appointments.index');
        //Documentation
        Route::get('/appointments/{documentation}', [DocumentationController::class, 'documentationIndex'])->name('documentation.show');
        Route::get('/appointments/{documentation}/edit', [DocumentationController::class, 'editDocumentation'])->name('documentation.edit');
        Route::post('/appointments/{documentation}', [DocumentationController::class, 'updateDocumentation'])->name('documentation.update');
        // Prescriptions
        Route::get('/prescriptions/{prescription}/edit', [DocumentationController::class, 'editPrescription'])->name('prescription.edit');
        Route::post('/prescriptions/{prescription}', [DocumentationController::class, 'updatePrescription'])->name('prescription.update');
        // Attachments
        Route::get('/attachments/{attachment}/edit', [DocumentationController::class, 'editAttachments'])->name('attachments.edit');
        Route::post('/attachments/{attachment}', [DocumentationController::class, 'updateAttachments'])->name('attachments.update');
        Route::delete('/attachments/{attachment}', [DocumentationController::class, 'destroyAttachment'])->name('attachments.destroy');
});

