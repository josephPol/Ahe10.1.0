<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('inicio');
});

Route::get('/inicio', function () {
    return view('inicio');
});

Route::get('/jugar', function () {
    return view('jugar');
});

Route::get('/learn', function () {
    return view('learn');
});

Route::get('/contact', function () {
    return view('contact');
});
