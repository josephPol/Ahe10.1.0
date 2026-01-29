<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ChessHub - Jugar</title>
  <link rel="stylesheet" href="{{ asset('css/main.css') }}" />
</head>
<body>
  @include('partials.header')

  <main class="contenedor">
    @include('partials.jugar_content')
  </main>

    <script src="{{ asset('js/theme.js') }}"></script>
  </body>
</html>
