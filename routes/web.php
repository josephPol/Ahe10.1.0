<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('html/inicio.html');
});

Route::get('/inicio', function () {
    return redirect('html/inicio.html');
});

Route::get('/jugar', function () {
    return redirect('html/jugar.html');
});

Route::get('/play', function () {
    return redirect('html/play.html');
});

Route::get('/jugar_local', function () {
    return redirect('html/jugar_local.html');
});

Route::get('/learn', function () {
    return redirect('html/learn.html');
});

Route::get('/contact', function () {
    return redirect('html/contact.html');
});

Route::get('/premium', function () {
    return redirect('html/premium.html');
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


