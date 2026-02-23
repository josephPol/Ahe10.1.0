<?php

namespace App\Http\Controllers;

use App\Models\Jugada;
use App\Models\User;
use Illuminate\Http\Request;

class JugadaController extends Controller
{
    public function index()
    {
        $jugadas = Jugada::with('user')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $jugadas
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'movimientos' => 'required|string',
            'imagen' => 'nullable|string',
        ]);

        $userId = User::query()->value('id');
        if (!$userId) {
            return response()->json([
                'success' => false,
                'error' => 'No hay usuarios disponibles para asociar la jugada.'
            ], 422);
        }

        $imagePath = 'imagenes/foto_jugadas.jpg';
        $imagePath = 'imagenes/foto_jugadas.jpg';

        $jugada = Jugada::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'movimientos' => $request->movimientos,
            'imagen' => $imagePath,
            'user_id' => $userId,
        ]);

        return response()->json([
            'success' => true,
            'data' => $jugada->load('user')
        ], 201);
    }

    public function like($id)
    {
        $jugada = Jugada::findOrFail($id);
        $jugada->increment('likes');

        return response()->json([
            'success' => true,
            'data' => [
                'likes' => $jugada->likes
            ]
        ]);
    }
}
