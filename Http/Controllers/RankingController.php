<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function index()
    {
        // Obtener los top 10 usuarios ordenados por victorias
        $topPlayers = User::orderBy('wins', 'desc')
                         ->orderBy('rating', 'desc')
                         ->take(10)
                         ->get();

        return response()->json([
            'success' => true,
            'data' => $topPlayers->map(function ($user) {
                return [
                    'name' => $user->name,
                    'wins' => $user->wins,
                    'losses' => $user->losses,
                    'draws' => $user->draws,
                    'total_games' => $user->total_games,
                    'rating' => $user->rating,
                    'win_rate' => $user->total_games > 0 
                        ? round(($user->wins / $user->total_games) * 100, 1) 
                        : 0
                ];
            })
        ]);
    }
}
