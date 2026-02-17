<?php

namespace App\Http\Controllers;

use App\Models\Jugada;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            'imagen' => 'required|string', // Base64 image
        ]);

        $userId = User::query()->value('id');
        if (!$userId) {
            return response()->json([
                'success' => false,
                'error' => 'No hay usuarios disponibles para asociar la jugada.'
            ], 422);
        }

        // Guardar imagen base64
        $imageData = $request->imagen;
        $imageName = 'jugada_' . time() . '.png';
        $imagePath = null;
        
        // Decodificar base64 y guardar
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $imageData = base64_decode($imageData);
            if ($imageData === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'La imagen del tablero no es válida.'
                ], 422);
            }

            $imagePath = 'jugadas/' . $imageName;
            Storage::disk('public')->put($imagePath, $imageData);
        } else {
            return response()->json([
                'success' => false,
                'error' => 'Formato de imagen no válido.'
            ], 422);
        }

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
