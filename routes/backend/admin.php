<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\{AdminController,TeamController,CategoryServiceController,ServiceController};

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


    });
