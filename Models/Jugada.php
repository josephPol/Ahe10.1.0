<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jugada extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'movimientos',
        'imagen',
        'user_id',
        'likes',
    ];

    protected $casts = [
        'movimientos' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
