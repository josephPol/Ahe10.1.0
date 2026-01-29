<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ChessHub - Ajedrez Online</title>
  <link rel="stylesheet" href="{{ asset('css/main.css') }}">
</head>
<body>
  @include('partials.header')

  <main class="contenedor">
    @include('partials.inicio_content')
  </main>

</body>
</html>
