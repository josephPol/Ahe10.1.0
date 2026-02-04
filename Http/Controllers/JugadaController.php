<?php

namespace App\Http\Controllers;

use App\Models\Jugada;
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

        // Guardar imagen base64
        $imageData = $request->imagen;
        $imageName = 'jugada_' . time() . '.png';
        
        // Decodificar base64 y guardar
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $imageData = base64_decode($imageData);
            Storage::disk('public')->put('jugadas/' . $imageName, $imageData);
        }

        $jugada = Jugada::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'movimientos' => $request->movimientos,
            'imagen' => 'jugadas/' . $imageName,
            'user_id' => 1, // Por ahora user 1, cambiar cuando haya auth
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
            'likes' => $jugada->likes
        ]);
    }
}
