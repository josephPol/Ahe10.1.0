const getAdminBaseUrl = () => new URL('../admin/', window.location.href).toString();
const getAuthBaseUrl = () => new URL('../auth/', window.location.href).toString();

const adminMessage = document.getElementById('adminMessage');
const usersList = document.getElementById('usersList');
const refreshBtn = document.getElementById('refreshBtn');
const createBtn = document.getElementById('createBtn');

function showMessage(type, text) {
  if (!adminMessage) return;
  adminMessage.className = `admin-message ${type}`;
  adminMessage.textContent = text;
}

function clearMessage() {
  if (!adminMessage) return;
  adminMessage.className = 'admin-message';
  adminMessage.textContent = '';
}

async function ensureAdmin() {
  try {
    const response = await fetch(getAuthBaseUrl() + 'session.php', { credentials: 'include' });
    const data = await response.json();
    if (!data.authenticated || !data.user || !data.user.is_admin) {
      window.location.href = new URL('inicio.html', window.location.href).toString();
      return false;
    }
    return true;
  } catch (error) {
    window.location.href = new URL('inicio.html', window.location.href).toString();
    return false;
  }
}

async function apiRequest(action, payload = {}) {
  const formData = new FormData();
  formData.append('action', action);
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

  const response = await fetch(getAdminBaseUrl() + 'users.php', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  return response.json();
}

function renderUsers(users) {
  if (!usersList) return;
  usersList.innerHTML = '';

  if (!users || users.length === 0) {
    usersList.innerHTML = '<div class="admin-loading">No hay usuarios</div>';
    return;
  }

  users.forEach(user => {
    const row = document.createElement('div');
    row.className = 'admin-table-row';

    const adminBadge = user.is_admin ? '<span class="admin-badge">Admin</span>' : 'Usuario';

    row.innerHTML = `
      <div>#${user.id}</div>
      <div>${user.name}</div>
      <div>${user.email}</div>
      <div>${adminBadge}</div>
      <div class="admin-actions-cell">
        <button class="btn-admin secondary" data-action="edit" data-id="${user.id}" data-name="${user.name}" data-email="${user.email}" data-admin="${user.is_admin ? 1 : 0}">Editar</button>
        <button class="btn-admin" data-action="reset" data-id="${user.id}">Reset pass</button>
        <button class="btn-admin danger" data-action="delete" data-id="${user.id}">Eliminar</button>
      </div>
    `;

    usersList.appendChild(row);
  });
}

async function loadUsers() {
  clearMessage();
  usersList.innerHTML = '<div class="admin-loading">Cargando usuarios...</div>';
  const data = await apiRequest('list');
  if (!data.success) {
    showMessage('error', data.message || 'No se pudo cargar usuarios');
    usersList.innerHTML = '';
    return;
  }
  renderUsers(data.data.users || []);
}

async function handleCreateUser() {
  clearMessage();
  const name = prompt('Nombre del usuario:');
  if (!name) return;
  const email = prompt('Email del usuario:');
  if (!email) return;
  const password = prompt('Contraseña (mínimo 8 caracteres):');
  if (!password) return;
  const isAdmin = confirm('¿Este usuario será admin?') ? 1 : 0;

  const data = await apiRequest('create', { name, email, password, is_admin: isAdmin });
  if (data.success) {
    showMessage('success', 'Usuario creado');
    loadUsers();
  } else {
    showMessage('error', data.message || 'No se pudo crear usuario');
  }
}

async function handleActionClick(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const userId = btn.dataset.id;
  if (!userId) return;

  if (action === 'delete') {
    const confirmed = confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmed) return;
    const data = await apiRequest('delete', { user_id: userId });
    if (data.success) {
      showMessage('success', 'Usuario eliminado');
      loadUsers();
    } else {
      showMessage('error', data.message || 'No se pudo eliminar');
    }
    return;
  }

  if (action === 'reset') {
    const newPassword = prompt('Nueva contraseña (mínimo 8 caracteres):');
    if (!newPassword) return;
    const data = await apiRequest('reset_password', {
      user_id: userId,
      new_password: newPassword
    });
    if (data.success) {
      showMessage('success', 'Contraseña actualizada');
    } else {
      showMessage('error', data.message || 'No se pudo actualizar');
    }
    return;
  }

  if (action === 'edit') {
    const currentName = btn.dataset.name || '';
    const currentEmail = btn.dataset.email || '';
    const currentAdmin = btn.dataset.admin === '1';

    const name = prompt('Nuevo nombre:', currentName);
    if (!name) return;
    const email = prompt('Nuevo email:', currentEmail);
    if (!email) return;
    const isAdmin = confirm('¿Este usuario será admin?') ? 1 : 0;

    const data = await apiRequest('update', {
      user_id: userId,
      name,
      email,
      is_admin: isAdmin
    });
    if (data.success) {
      showMessage('success', 'Usuario actualizado');
      loadUsers();
    } else {
      showMessage('error', data.message || 'No se pudo actualizar');
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await ensureAdmin();
  if (!allowed) return;

  if (refreshBtn) refreshBtn.addEventListener('click', loadUsers);
  if (createBtn) createBtn.addEventListener('click', handleCreateUser);
  if (usersList) usersList.addEventListener('click', handleActionClick);

  loadUsers();
});
