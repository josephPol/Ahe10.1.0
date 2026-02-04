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

Route::get('/jugar_bot', function () {
    return response()->file(public_path('jugar_bot.html'));
});

Route::get('/play', function () {
    return response()->file(public_path('play.html'));
});

Route::get('/jugar_local', function () {
    return response()->file(public_path('jugar_local.html'));
});

Route::get('/learn', function () {
    return response()->file(public_path('learn.html'));
});

Route::get('/contact', function () {
    return response()->file(public_path('contact.html'));
});

use App\Http\Controllers\ContactController;

// Preserve POST route for programmatic clients and add a GET submit endpoint
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/contact/submit', [ContactController::class, 'store'])->name('contact.store.get');
