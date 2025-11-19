<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Secretary\{SecretaryController,UsersController,AppointmentController,InvoiceController,
    DoctorAvailabilityController,DocumentationController,PrescriptionController,AppointmentPaymentController};

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

        //Appointments
        Route::get('/appointment', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::get('/appointment/create', [AppointmentController::class, 'create'])->name('appointments.create');
        Route::post('/appointment', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::get('/appointment/{schedule}', [AppointmentController::class, 'show'])->name('appointments.show');
        Route::get('/appointment/{schedule}/edit', [AppointmentController::class, 'edit'])->name('appointments.edit');
        Route::put('/appointment/{schedule}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('/appointment/{schedule}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');
        Route::patch('payments/appointments/{appointment}/payments/update-status',[AppointmentPaymentController::class, 'updateBothStatuses'])
        ->name('appointments.payments.update-both-status');


        //Doctor Availability
        Route::get('/doctor-availability', [DoctorAvailabilityController::class, 'index'])->name('doctor-availability.index');
        Route::get('/doctor-availability/{id}', [DoctorAvailabilityController::class, 'show'])
            ->name('doctor-availability.show');
        Route::get('/doctor-availability/create/{id}', [DoctorAvailabilityController::class, 'create'])
            ->name('doctor-availability.create');
        Route::post('/doctor-availability', [DoctorAvailabilityController::class, 'store'])
            ->name('doctor-availability.store');
        Route::get('/doctor-availability/{id}/edit', [DoctorAvailabilityController::class, 'edit'])
            ->name('doctor-availability.edit');
        Route::put('/doctor-availability/{id}/update', [DoctorAvailabilityController::class, 'update'])
            ->name('doctor-availability.update');
        Route::get('/doctor/{doctor}/available-dates', [AppointmentController::class, 'availableDates']);
        Route::get('/availability-date/{date}/available-slots', [AppointmentController::class, 'availableSlots']);
        
        //Documentation
        Route::get('/documentation', [DocumentationController::class, 'Index'])
            ->name('documentation.index');
        Route::get('/appointment/documentation/{id}/documentation', [DocumentationController::class, 'documentationShow'])
            ->name('appointments.documentation.index');
        Route::get('documentation/{id}/prescription-generate', [DocumentationController::class, 'prescriptionGenerate'])
            ->name('documentation.prescription-generate');
        //PrescriptionController
        Route::post('prescription/documentation/{id}/prescription-store', [PrescriptionController::class, 'prescriptionStore'])
            ->name('documentation.prescription-store');

        Route::post('prescription/prescription-invoice/documentation/{id}/prescription-invoice', 
            [PrescriptionController::class, 'prescriptionInvoice'])
            ->name('documentation.prescription-invoice');
        Route::get('prescription/prescription-invoice/documentation/{id}/prescription-invoice/download', 
            [PrescriptionController::class, 'prescriptionInvoiceDownload'])
            ->name('documentation.prescription-invoice.download');    
        //PrescriptionController PDF generation route
        Route::get('prescription/documentation/{id}/prescription-pdf', [PrescriptionController::class, 'prescriptionPDF'])
            ->name('documentation.prescription-pdf');

        //Faturacao 
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}/show', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
        Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
        Route::get('/secretary/invoices/{id}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
        Route::delete('/invoices/{invoice}/destroy', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

        //Profiles
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    });
