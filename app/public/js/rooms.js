const getRoomsUrl = () => new URL('../rooms/rooms.php', window.location.href).toString();

const roomsContainer = document.getElementById('roomsList');

const renderRooms = (rooms) => {
  if (!roomsContainer) return;
  if (!rooms || rooms.length === 0) {
    roomsContainer.innerHTML = '<div class="loading">No hay salas activas</div>';
    return;
  }

  roomsContainer.innerHTML = rooms.map((room) => {
    return `
      <div class="room-card">
        <div class="room-head">
          <h3>${room.nombre}</h3>
          <span class="room-badge">${room.modo}</span>
        </div>
        <p class="room-desc">${room.descripcion || 'Sala de juego disponible.'}</p>
        <div class="room-meta">
          <span>👥 ${room.max_players} jugadores</span>
          <span>🟢 ${room.status}</span>
        </div>
        <button class="btn btn-secondary" disabled>Entrar (próximamente)</button>
      </div>
    `;
  }).join('');
};

const loadRooms = async () => {
  if (!roomsContainer) return;
  roomsContainer.innerHTML = '<div class="loading">Cargando salas...</div>';
  try {
    const response = await fetch(getRoomsUrl());
    const data = await response.json();
    if (data.success) {
      renderRooms(data.data);
    } else {
      roomsContainer.innerHTML = '<div class="loading">No se pudieron cargar las salas</div>';
    }
  } catch (error) {
    roomsContainer.innerHTML = '<div class="loading">Error al cargar salas</div>';
  }
};

document.addEventListener('DOMContentLoaded', loadRooms);
