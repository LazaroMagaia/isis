<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\{AdminController,TeamController,CategoryServiceController,ServiceController,
    MedicineController,MedicineBatchController,MedicineStockMovementController,MedicineCategoryController};

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

        //Team
        Route::get('/team', [TeamController::class, 'index'])->name('team.index');
        Route::get('/team/create', [TeamController::class, 'create'])->name('team.create');
        Route::post('/team', [TeamController::class, 'store'])->name('team.store');
        Route::get('/team/{team}', [TeamController::class, 'show'])->name('team.show');
        Route::get('/team/{team}/edit', [TeamController::class, 'edit'])->name('team.edit');
        Route::put('/team/{team}', [TeamController::class, 'update'])->name('team.update');
        Route::delete('/team/{team}', [TeamController::class, 'destroy'])->name('team.destroy');
        //Patient
        Route::get('/patient', [AdminController::class, 'patient'])->name('patient.index');
        // Services and Categories
        Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
        Route::get('/services/create', [ServiceController::class, 'create'])->name('services.create');
        Route::post('/services', [ServiceController::class, 'store'])->name('services.store');
        Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
        Route::get('/services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
        Route::put('/services/{service}', [ServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');
        //ServiveCategories
        Route::get('/services-category', [CategoryServiceController::class, 'index'])->name('services.category.index');
        Route::post('/services-category', [CategoryServiceController::class, 'store'])->name('services.category.store');
        Route::put('/services-category/{id}', [CategoryServiceController::class, 'update'])->name('services.category.update');
        Route::delete('/services-category/{id}', [CategoryServiceController::class, 'destroy'])->name('services.category.destroy');
        //MedicineCategoryController
        Route::get('/medicine-categories', [MedicineCategoryController::class, 'index'])->name('medicinecategories.index');
        Route::get('/medicine-categories/create', [MedicineCategoryController::class, 'create'])->name('medicinecategories.create');
        Route::post('/medicine-categories', [MedicineCategoryController::class, 'store'])->name('medicinecategories.store');
        Route::get('/medicine-categories/{category}/edit', [MedicineCategoryController::class, 'edit'])->name('medicinecategories.edit');
        Route::put('/medicine-categories/{category}', [MedicineCategoryController::class, 'update'])->name('medicinecategories.update');
        Route::delete('/medicine-categories/{category}', [MedicineCategoryController::class, 'destroy'])->name('medicinecategories.destroy');

        //MedicineController
        Route::get('/medicines', [MedicineController::class, 'index'])->name('medicines.index');
        Route::get('/medicines/create', [MedicineController::class, 'create'])->name('medicines.create');
        Route::post('/medicines', [MedicineController::class, 'store'])->name('medicines.store');
        Route::get('/medicines/{medicine}/edit', [MedicineController::class, 'edit'])->name('medicines.edit');
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update'])->name('medicines.update');
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy'])->name('medicines.destroy');
        //MedicineBatchController
        Route::get('/medicine-batches/{id}', [MedicineBatchController::class, 'index'])->name('medicinebatches.index');
        Route::get('/medicine-batches/create/{id}', [MedicineBatchController::class, 'create'])->name('medicinebatches.create');
        Route::post('/medicine-batches/{id}', [MedicineBatchController::class, 'store'])->name('medicinebatches.store'); 
        Route::get('/medicine-batches/{batch}/edit/{id}', [MedicineBatchController::class, 'edit'])->name('medicinebatches.edit');
        Route::put('/medicine-batches/{batch}', [MedicineBatchController::class, 'update'])->name('medicinebatches.update');
        Route::delete('/medicine-batches/{batch}', [MedicineBatchController::class, 'destroy'])->name('medicinebatches.destroy');

    });
