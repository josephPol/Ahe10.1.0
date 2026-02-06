<?php

namespace Database\Seeders;

use App\Models\Jugada;
use App\Models\User;
use Illuminate\Database\Seeder;

class JugadasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Asegurarse de que existe un usuario para las jugadas
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Sistema',
                'email' => 'sistema@ajedrez.com',
            ]);
        }

        $jugadas = [
            [
                'nombre' => 'Mate del Pastor',
                'descripcion' => 'Una de las trampas más famosas del ajedrez. El objetivo es atacar el punto f7, el más débil del negro al inicio. Se desarrolla el alfil y la dama rápidamente para crear una amenaza letal. ¡Perfecto para principiantes!',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'e7', 'to' => 'e5', 'piece' => 'p', 'san' => 'e5'],
                    ['color' => 'w', 'from' => 'f1', 'to' => 'c4', 'piece' => 'b', 'san' => 'Bc4'],
                    ['color' => 'b', 'from' => 'b8', 'to' => 'c6', 'piece' => 'n', 'san' => 'Nc6'],
                    ['color' => 'w', 'from' => 'd1', 'to' => 'h5', 'piece' => 'q', 'san' => 'Qh5'],
                    ['color' => 'b', 'from' => 'g8', 'to' => 'f6', 'piece' => 'n', 'san' => 'Nf6'],
                    ['color' => 'w', 'from' => 'h5', 'to' => 'f7', 'piece' => 'q', 'san' => 'Qxf7#']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 15,
            ],
            [
                'nombre' => 'Apertura Española (Ruy López)',
                'descripcion' => 'Una de las aperturas más antiguas y respetadas del ajedrez. Las blancas desarrollan sus piezas rápidamente, controlan el centro y presionan el caballo en c6. Es la favorita de muchos grandes maestros por su solidez estratégica.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'e7', 'to' => 'e5', 'piece' => 'p', 'san' => 'e5'],
                    ['color' => 'w', 'from' => 'g1', 'to' => 'f3', 'piece' => 'n', 'san' => 'Nf3'],
                    ['color' => 'b', 'from' => 'b8', 'to' => 'c6', 'piece' => 'n', 'san' => 'Nc6'],
                    ['color' => 'w', 'from' => 'f1', 'to' => 'b5', 'piece' => 'b', 'san' => 'Bb5']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 23,
            ],
            [
                'nombre' => 'Defensa Siciliana',
                'descripcion' => 'La defensa más popular contra 1.e4. Las negras buscan un juego asimétrico y dinámico, evitando las típicas estructuras simétricas. Es la elección favorita de jugadores agresivos que buscan ganar con negras.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'c7', 'to' => 'c5', 'piece' => 'p', 'san' => 'c5'],
                    ['color' => 'w', 'from' => 'g1', 'to' => 'f3', 'piece' => 'n', 'san' => 'Nf3'],
                    ['color' => 'b', 'from' => 'd7', 'to' => 'd6', 'piece' => 'p', 'san' => 'd6'],
                    ['color' => 'w', 'from' => 'd2', 'to' => 'd4', 'piece' => 'p', 'san' => 'd4'],
                    ['color' => 'b', 'from' => 'c5', 'to' => 'd4', 'piece' => 'p', 'san' => 'cxd4']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 18,
            ],
            [
                'nombre' => 'Gambito de Dama',
                'descripcion' => 'Un clásico atemporal del ajedrez. Las blancas ofrecen un peón para obtener un rápido desarrollo y control del centro. Aunque el peón puede recuperarse, lo importante es la ventaja posicional que se obtiene. Inmortalizada en la serie "Gambito de Dama".',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'd2', 'to' => 'd4', 'piece' => 'p', 'san' => 'd4'],
                    ['color' => 'b', 'from' => 'd7', 'to' => 'd5', 'piece' => 'p', 'san' => 'd5'],
                    ['color' => 'w', 'from' => 'c2', 'to' => 'c4', 'piece' => 'p', 'san' => 'c4'],
                    ['color' => 'b', 'from' => 'd5', 'to' => 'c4', 'piece' => 'p', 'san' => 'dxc4'],
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e3', 'piece' => 'p', 'san' => 'e3']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 31,
            ],
            [
                'nombre' => 'Defensa India de Rey',
                'descripcion' => 'Una defensa hipermoderna donde las negras permiten que las blancas ocupen el centro con peones, para luego atacarlo con piezas. El fianchetto del alfil en g7 es característico. Muy popular entre jugadores dinámicos y creativos.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'd2', 'to' => 'd4', 'piece' => 'p', 'san' => 'd4'],
                    ['color' => 'b', 'from' => 'g8', 'to' => 'f6', 'piece' => 'n', 'san' => 'Nf6'],
                    ['color' => 'w', 'from' => 'c2', 'to' => 'c4', 'piece' => 'p', 'san' => 'c4'],
                    ['color' => 'b', 'from' => 'g7', 'to' => 'g6', 'piece' => 'p', 'san' => 'g6'],
                    ['color' => 'w', 'from' => 'b1', 'to' => 'c3', 'piece' => 'n', 'san' => 'Nc3'],
                    ['color' => 'b', 'from' => 'f8', 'to' => 'g7', 'piece' => 'b', 'san' => 'Bg7']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 19,
            ],
            [
                'nombre' => 'Mate de la Escalera',
                'descripcion' => 'Un patrón de mate donde la torre y el rey trabajan juntos para acorralar al rey enemigo hacia el borde del tablero. Es una técnica fundamental que todo jugador debe dominar para convertir ventajas materiales en victoria.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'e7', 'to' => 'e5', 'piece' => 'p', 'san' => 'e5'],
                    ['color' => 'w', 'from' => 'g1', 'to' => 'f3', 'piece' => 'n', 'san' => 'Nf3'],
                    ['color' => 'b', 'from' => 'f7', 'to' => 'f6', 'piece' => 'p', 'san' => 'f6'],
                    ['color' => 'w', 'from' => 'f3', 'to' => 'e5', 'piece' => 'n', 'san' => 'Nxe5'],
                    ['color' => 'b', 'from' => 'f6', 'to' => 'e5', 'piece' => 'p', 'san' => 'fxe5'],
                    ['color' => 'w', 'from' => 'd1', 'to' => 'h5', 'piece' => 'q', 'san' => 'Qh5+']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 12,
            ],
            [
                'nombre' => 'Apertura Italiana',
                'descripcion' => 'Una apertura clásica y directa donde las blancas desarrollan rápidamente el alfil a c4, apuntando al débil punto f7. Perfecta para principiantes por sus planes claros: desarrollo rápido, enroque y ataque. Solida y efectiva en todos los niveles.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'e7', 'to' => 'e5', 'piece' => 'p', 'san' => 'e5'],
                    ['color' => 'w', 'from' => 'g1', 'to' => 'f3', 'piece' => 'n', 'san' => 'Nf3'],
                    ['color' => 'b', 'from' => 'b8', 'to' => 'c6', 'piece' => 'n', 'san' => 'Nc6'],
                    ['color' => 'w', 'from' => 'f1', 'to' => 'c4', 'piece' => 'b', 'san' => 'Bc4']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 27,
            ],
            [
                'nombre' => 'Defensa Francesa',
                'descripcion' => 'Una defensa sólida donde las negras construyen una cadena de peones que controla el centro. Es posicionalmente compleja y conduce a batallas estratégicas profundas. Ideal para jugadores pacientes que prefieren la estrategia sobre la táctica.',
                'movimientos' => json_encode([
                    ['color' => 'w', 'from' => 'e2', 'to' => 'e4', 'piece' => 'p', 'san' => 'e4'],
                    ['color' => 'b', 'from' => 'e7', 'to' => 'e6', 'piece' => 'p', 'san' => 'e6'],
                    ['color' => 'w', 'from' => 'd2', 'to' => 'd4', 'piece' => 'p', 'san' => 'd4'],
                    ['color' => 'b', 'from' => 'd7', 'to' => 'd5', 'piece' => 'p', 'san' => 'd5'],
                    ['color' => 'w', 'from' => 'b1', 'to' => 'c3', 'piece' => 'n', 'san' => 'Nc3']
                ]),
                'imagen' => null,
                'user_id' => $user->id,
                'likes' => 14,
            ],
        ];

        foreach ($jugadas as $jugada) {
            Jugada::create($jugada);
        }

        $this->command->info('✓ 8 jugadas de ejemplo creadas exitosamente');
    }
}
