<!-- HERO SECTION -->
<section class="hero">
  <h1>Bienvenido a ChessHub</h1>
  <p>La plataforma definitiva para aprender, jugar y dominar el ajedrez</p>
  <div class="cta-buttons">
    <a href="{{ url('/jugar') }}" class="btn btn-primary">⚔ Jugar Ahora</a>
    <a href="{{ url('/learn') }}" class="btn btn-secondary">📚 Aprender Ajedrez</a>
  </div>
</section>

<!-- FEATURES SECTION -->
<section class="features">
  <div class="feature-card">
    <div class="icon">♞</div>
    <h3>Juega Online</h3>
    <p>Compite contra jugadores de todo el mundo en tiempo real. Mejora tu rating y sube en las clasificaciones.</p>
  </div>
  
  <div class="feature-card">
    <div class="icon">📚</div>
    <h3>Aprende</h3>
    <p>Accede a lecciones detalladas, análisis de partidas maestras y estrategias avanzadas de ajedrez.</p>
  </div>
  
  <div class="feature-card">
    <div class="icon">🎯</div>
    <h3>Análisis</h3>
    <p>Analiza tus partidas con motor de IA de último nivel. Identifica errores y mejora tu juego.</p>
  </div>
  
  <div class="feature-card">
    <div class="icon">🏆</div>
    <h3>Torneos</h3>
    <p>Participa en torneos regulares, gana premios y demuestra tu habilidad contra los mejores.</p>
  </div>
</section>

<!-- STATS SECTION -->
<section class="stats">
  <div class="stat-box">
    <div class="stat-number">50K+</div>
    <div class="stat-label">Jugadores Activos</div>
  </div>
  
  <div class="stat-box">
    <div class="stat-number">1M+</div>
    <div class="stat-label">Partidas Jugadas</div>
  </div>
  
  <div class="stat-box">
    <div class="stat-number">200+</div>
    <div class="stat-label">Lecciones</div>
  </div>
  
  <div class="stat-box">
    <div class="stat-number">24/7</div>
    <div class="stat-label">Disponible</div>
  </div>
</section>

<!-- INFO SECTION -->
<section class="info-section">
  <h2>📖 Conoce el Ajedrez</h2>
  
  <div class="info-grid">
    <div class="info-item">
      <h4>♚ El Rey</h4>
      <p>La pieza más importante. Se mueve una casilla en cualquier dirección. Tu objetivo es protegerlo.</p>
    </div>
    
    <div class="info-item">
      <h4>♛ La Reina</h4>
      <p>La pieza más poderosa. Se mueve cualquier número de casillas en línea recta o diagonal.</p>
    </div>
    
    <div class="info-item">
      <h4>♜ La Torre</h4>
      <p>Se mueve cualquier número de casillas horizontalmente o verticalmente. Muy útil en finales.</p>
    </div>
    
    <div class="info-item">
      <h4>♝ El Alfil</h4>
      <p>Se mueve cualquier número de casillas en diagonal. Controla casillas del mismo color siempre.</p>
    </div>
    
    <div class="info-item">
      <h4>♞ El Caballo</h4>
      <p>Se mueve en forma de L. Es la única pieza que puede saltar sobre otras. Muy versátil.</p>
    </div>
    
    <div class="info-item">
      <h4>♟ El Peón</h4>
      <p>Avanza una casilla (o dos en su primer movimiento). Captura en diagonal. ¡Puede coronarse!</p>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <p>&copy; 2024 ChessHub. Todos los derechos reservados.</p>
  <div class="footer-links">
    <a href="{{ url('/contact') }}">Contacto</a>
    <a href="#">Privacidad</a>
    <a href="#">Términos</a>
    <a href="#">Ayuda</a>
  </div>
</footer>
