const getAdminBaseUrl = () => new URL('../admin/', window.location.href).toString();
const getAuthBaseUrl = () => new URL('../auth/', window.location.href).toString();

const $ = (id) => document.getElementById(id);
const adminMessage = $('adminMessage');
const usersList = $('usersList');
const refreshBtn = $('refreshBtn');
const createBtn = $('createBtn');
const modal = {
  wrap: $('adminModal'),
  title: $('adminModalTitle'),
  body: $('adminModalBody'),
  close: $('adminModalClose'),
  cancel: $('adminModalCancel'),
  submit: $('adminModalSubmit')
};

const state = { action: null, userId: null };

const showMessage = (type, text) => {
  if (!adminMessage) return;
  adminMessage.className = type ? `admin-message ${type}` : 'admin-message';
  adminMessage.textContent = text || '';
};

const openModal = (title, bodyHtml, action, userId = null) => {
  if (!modal.wrap) return;
  state.action = action;
  state.userId = userId;
  modal.title.textContent = title;
  modal.body.innerHTML = bodyHtml;
  modal.wrap.classList.add('is-open');
  modal.wrap.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  if (!modal.wrap) return;
  modal.wrap.classList.remove('is-open');
  modal.wrap.setAttribute('aria-hidden', 'true');
  modal.body.innerHTML = '';
  state.action = null;
  state.userId = null;
};

const valueOf = (selector) => modal.body.querySelector(selector)?.value.trim() || '';
const checkedOf = (selector) => !!modal.body.querySelector(selector)?.checked;

const ensureAdmin = async () => {
  try {
    const res = await fetch(getAuthBaseUrl() + 'session.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.authenticated || !data.user?.is_admin) {
      window.location.href = new URL('inicio.html', window.location.href).toString();
      return false;
    }
    return true;
  } catch {
    window.location.href = new URL('inicio.html', window.location.href).toString();
    return false;
  }
};

const apiRequest = async (action, payload = {}) => {
  const formData = new FormData();
  formData.append('action', action);
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
  const response = await fetch(getAdminBaseUrl() + 'users.php', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  return response.json();
};

const renderUsers = (users) => {
  if (!usersList) return;
  if (!users || users.length === 0) {
    usersList.innerHTML = '<div class="admin-loading">No hay usuarios</div>';
    return;
  }
  usersList.innerHTML = users.map((user) => {
    const badge = user.is_admin ? '<span class="admin-badge">Admin</span>' : 'Usuario';
    return `
      <div class="admin-table-row">
        <div>#${user.id}</div>
        <div>${user.name}</div>
        <div>${user.email}</div>
        <div>${badge}</div>
        <div class="admin-actions-cell">
          <button class="btn-admin secondary" data-action="edit" data-id="${user.id}" data-name="${user.name}" data-email="${user.email}" data-admin="${user.is_admin ? 1 : 0}">Editar</button>
          <button class="btn-admin" data-action="reset" data-id="${user.id}">Reset pass</button>
          <button class="btn-admin danger" data-action="delete" data-id="${user.id}">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');
};

const loadUsers = async () => {
  showMessage('', '');
  usersList.innerHTML = '<div class="admin-loading">Cargando usuarios...</div>';
  const data = await apiRequest('list');
  if (!data.success) {
    showMessage('error', data.message || 'No se pudo cargar usuarios');
    usersList.innerHTML = '';
    return;
  }
  renderUsers(data.data.users || []);
};

const openCreateModal = () => openModal(
  'Crear usuario',
  `
    <label>Nombre</label>
    <input type="text" id="modalName" placeholder="Nombre">
    <label>Email</label>
    <input type="email" id="modalEmail" placeholder="email@ejemplo.com">
    <label>Contraseña</label>
    <input type="password" id="modalPassword" placeholder="Mínimo 8 caracteres">
    <label class="admin-checkbox">
      <input type="checkbox" id="modalIsAdmin"> Admin
    </label>
  `,
  'create'
);

const handleActionClick = (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const userId = btn.dataset.id;
  if (!userId) return;

  if (action === 'delete') {
    openModal('Eliminar usuario', '<p>¿Eliminar este usuario? Esta acción no se puede deshacer.</p>', 'delete', userId);
    return;
  }
  if (action === 'reset') {
    openModal('Resetear contraseña', `
      <label>Nueva contraseña</label>
      <input type="password" id="modalPassword" placeholder="Mínimo 8 caracteres">
    `, 'reset_password', userId);
    return;
  }
  if (action === 'edit') {
    const currentName = btn.dataset.name || '';
    const currentEmail = btn.dataset.email || '';
    const currentAdmin = btn.dataset.admin === '1';
    openModal('Editar usuario', `
      <label>Nombre</label>
      <input type="text" id="modalName" value="${currentName}">
      <label>Email</label>
      <input type="email" id="modalEmail" value="${currentEmail}">
      <label class="admin-checkbox">
        <input type="checkbox" id="modalIsAdmin" ${currentAdmin ? 'checked' : ''}> Admin
      </label>
    `, 'update', userId);
  }
};

const handleModalSubmit = async () => {
  if (!state.action) return;

  if (state.action === 'create') {
    const name = valueOf('#modalName');
    const email = valueOf('#modalEmail');
    const password = valueOf('#modalPassword');
    const isAdmin = checkedOf('#modalIsAdmin') ? 1 : 0;
    if (!name || !email || !password) {
      showMessage('error', 'Completa todos los campos');
      return;
    }
    const data = await apiRequest('create', { name, email, password, is_admin: isAdmin });
    if (data.success) {
      showMessage('success', 'Usuario creado');
      closeModal();
      loadUsers();
    } else {
      showMessage('error', data.message || 'No se pudo crear usuario');
    }
    return;
  }

  if (state.action === 'update') {
    const name = valueOf('#modalName');
    const email = valueOf('#modalEmail');
    const isAdmin = checkedOf('#modalIsAdmin') ? 1 : 0;
    if (!name || !email) {
      showMessage('error', 'Completa todos los campos');
      return;
    }
    const data = await apiRequest('update', { user_id: state.userId, name, email, is_admin: isAdmin });
    if (data.success) {
      showMessage('success', 'Usuario actualizado');
      closeModal();
      loadUsers();
    } else {
      showMessage('error', data.message || 'No se pudo actualizar');
    }
    return;
  }

  if (state.action === 'reset_password') {
    const newPassword = valueOf('#modalPassword');
    if (!newPassword) {
      showMessage('error', 'Introduce una contraseña');
      return;
    }
    const data = await apiRequest('reset_password', { user_id: state.userId, new_password: newPassword });
    if (data.success) {
      showMessage('success', 'Contraseña actualizada');
      closeModal();
    } else {
      showMessage('error', data.message || 'No se pudo actualizar');
    }
    return;
  }

  if (state.action === 'delete') {
    const data = await apiRequest('delete', { user_id: state.userId });
    if (data.success) {
      showMessage('success', 'Usuario eliminado');
      closeModal();
      loadUsers();
    } else {
      showMessage('error', data.message || 'No se pudo eliminar');
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  if (!(await ensureAdmin())) return;
  refreshBtn?.addEventListener('click', loadUsers);
  createBtn?.addEventListener('click', openCreateModal);
  usersList?.addEventListener('click', handleActionClick);
  modal.close?.addEventListener('click', closeModal);
  modal.cancel?.addEventListener('click', closeModal);
  modal.submit?.addEventListener('click', handleModalSubmit);
  modal.wrap?.addEventListener('click', (event) => {
    if (event.target === modal.wrap) closeModal();
  });
  loadUsers();
});
