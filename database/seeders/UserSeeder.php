<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Magnus Carlsen',
                'email' => 'magnus@chess.com',
                'password' => Hash::make('password'),
                'wins' => 150,
                'losses' => 20,
                'draws' => 30,
                'total_games' => 200,
                'rating' => 2850
            ],
            [
                'name' => 'Hikaru Nakamura',
                'email' => 'hikaru@chess.com',
                'password' => Hash::make('password'),
                'wins' => 145,
                'losses' => 25,
                'draws' => 30,
                'total_games' => 200,
                'rating' => 2790
            ],
            [
                'name' => 'Fabiano Caruana',
                'email' => 'fabiano@chess.com',
                'password' => Hash::make('password'),
                'wins' => 130,
                'losses' => 30,
                'draws' => 40,
                'total_games' => 200,
                'rating' => 2780
            ],
            [
                'name' => 'Ding Liren',
                'email' => 'ding@chess.com',
                'password' => Hash::make('password'),
                'wins' => 125,
                'losses' => 35,
                'draws' => 40,
                'total_games' => 200,
                'rating' => 2770
            ],
            [
                'name' => 'Ian Nepomniachtchi',
                'email' => 'ian@chess.com',
                'password' => Hash::make('password'),
                'wins' => 120,
                'losses' => 40,
                'draws' => 40,
                'total_games' => 200,
                'rating' => 2765
            ],
            [
                'name' => 'Alireza Firouzja',
                'email' => 'alireza@chess.com',
                'password' => Hash::make('password'),
                'wins' => 115,
                'losses' => 35,
                'draws' => 30,
                'total_games' => 180,
                'rating' => 2760
            ],
            [
                'name' => 'Wesley So',
                'email' => 'wesley@chess.com',
                'password' => Hash::make('password'),
                'wins' => 110,
                'losses' => 40,
                'draws' => 35,
                'total_games' => 185,
                'rating' => 2750
            ],
            [
                'name' => 'Levon Aronian',
                'email' => 'levon@chess.com',
                'password' => Hash::make('password'),
                'wins' => 105,
                'losses' => 45,
                'draws' => 40,
                'total_games' => 190,
                'rating' => 2740
            ],
            [
                'name' => 'Maxime Vachier',
                'email' => 'maxime@chess.com',
                'password' => Hash::make('password'),
                'wins' => 100,
                'losses' => 50,
                'draws' => 40,
                'total_games' => 190,
                'rating' => 2730
            ],
            [
                'name' => 'Anish Giri',
                'email' => 'anish@chess.com',
                'password' => Hash::make('password'),
                'wins' => 95,
                'losses' => 45,
                'draws' => 50,
                'total_games' => 190,
                'rating' => 2720
            ]
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
