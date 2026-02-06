// Rankings functionality
document.addEventListener('DOMContentLoaded', function() {
    loadRankings();
});

async function loadRankings() {
    try {
        const response = await fetch('/api/rankings');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            displayRankings(data.data);
        } else {
            displayNoRankings();
        }
    } catch (error) {
        console.error('Error loading rankings:', error);
        displayError();
    }
}

function displayRankings(players) {
    const rankingsList = document.getElementById('rankings-list');
    rankingsList.innerHTML = '';
    
    players.forEach((player, index) => {
        const rankingRow = document.createElement('div');
        rankingRow.className = 'ranking-row';
        
        // Agregar medallas para top 3
        let rankDisplay = index + 1;
        if (index === 0) rankDisplay = '🥇';
        else if (index === 1) rankDisplay = '🥈';
        else if (index === 2) rankDisplay = '🥉';
        
        rankingRow.innerHTML = `
            <div class="rank-col rank-${index + 1}">${rankDisplay}</div>
            <div class="player-col">
                <div class="player-avatar">👤</div>
                <span class="player-name">${escapeHtml(player.name)}</span>
            </div>
            <div class="wins-col">${player.wins}</div>
            <div class="games-col">${player.total_games}</div>
            <div class="winrate-col">${player.win_rate}%</div>
            <div class="rating-col">${player.rating}</div>
        `;
        
        rankingsList.appendChild(rankingRow);
    });
}

function displayNoRankings() {
    const rankingsList = document.getElementById('rankings-list');
    rankingsList.innerHTML = `
        <div class="no-rankings">
            <p>🎮 Aún no hay jugadores en el ranking</p>
            <p>¡Sé el primero en jugar y aparecer aquí!</p>
        </div>
    `;
}

function displayError() {
    const rankingsList = document.getElementById('rankings-list');
    rankingsList.innerHTML = `
        <div class="error-rankings">
            <p>❌ Error al cargar los rankings</p>
            <button onclick="loadRankings()" class="btn btn-secondary">🔄 Reintentar</button>
        </div>
    `;
}

// Escapar HTML para prevenir XSS (definida en utils.js)
// function escapeHtml(text) { ... } ← ver utils.js
