<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->file(public_path('inicio.html'));
});

Route::get('/inicio', function () {
    return response()->file(public_path('inicio.html'));
});

Route::get('/jugar', function () {
    return response()->file(public_path('jugar.html'));
});

Route::get('/play', function () {
    return response()->file(public_path('play.html'));
});

Route::get('/learn', function () {
    return response()->file(public_path('learn.html'));
});

Route::get('/contact', function () {
    return response()->file(public_path('contact.html'));
});

use App\Http\Controllers\ContactController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\JugadaController;

// Preserve POST route for programmatic clients and add a GET submit endpoint
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/contact/submit', [ContactController::class, 'store'])->name('contact.store.get');

// API endpoint for rankings
Route::get('/api/rankings', [RankingController::class, 'index'])->name('rankings.index');

// API endpoints for jugadas
Route::get('/api/jugadas', [JugadaController::class, 'index'])->name('jugadas.index');
Route::post('/api/jugadas', [JugadaController::class, 'store'])->name('jugadas.store');
Route::post('/api/jugadas/{id}/like', [JugadaController::class, 'like'])->name('jugadas.like');
