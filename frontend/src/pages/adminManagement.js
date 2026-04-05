/**
 * Admin Password Management
 */

function getApiClient() {
  if (!globalThis.apiClient && globalThis.ApiClient) {
    globalThis.apiClient = new globalThis.ApiClient();
  }
  if (!globalThis.apiClient) {
    throw new Error('API client is not initialized');
  }
  return globalThis.apiClient;
}

async function loadAdminManagement() {
  setupDepartmentPasswordForm();
  setupDashboardPasswordForm();
  setupDepartmentCreateForm();
  setupDepartmentDeleteForm();
  setupDashboardUserCreateForm();
  setupDashboardUserDeleteForm();
  await loadAdminDepartmentOptions();
}

function setupDepartmentPasswordForm() {
  const form = document.getElementById('admin-update-department-password-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDepartmentPasswordUpdate);
  form.dataset.bound = 'true';
}

function setupDashboardPasswordForm() {
  const form = document.getElementById('admin-update-dashboard-password-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDashboardPasswordUpdate);
  form.dataset.bound = 'true';
}

async function loadAdminDepartmentOptions() {
  const passwordSelect = document.getElementById('admin-manage-dept-select');
  const deleteSelect = document.getElementById('admin-delete-dept-select');
  if (!passwordSelect && !deleteSelect) {
    return;
  }

  try {
    const response = await getApiClient().getDepartments();
    const departments = response?.data || [];

    const targets = [passwordSelect, deleteSelect].filter(Boolean);
    targets.forEach((target) => {
      target.innerHTML = '<option value="">-- Select Department --</option>';
      departments.forEach((department) => {
        const option = document.createElement('option');
        option.value = department.id;
        option.textContent = department.name;
        target.appendChild(option);
      });
    });
  } catch (error) {
    showErrorToast(error.message || 'Failed to load departments');
  }
}

function setupDepartmentCreateForm() {
  const form = document.getElementById('admin-create-department-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDepartmentCreate);
  form.dataset.bound = 'true';
}

function setupDepartmentDeleteForm() {
  const form = document.getElementById('admin-delete-department-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDepartmentDelete);
  form.dataset.bound = 'true';
}

function setupDashboardUserCreateForm() {
  const form = document.getElementById('admin-create-dashboard-user-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDashboardUserCreate);
  form.dataset.bound = 'true';
}

function setupDashboardUserDeleteForm() {
  const form = document.getElementById('admin-delete-dashboard-user-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleDashboardUserDelete);
  form.dataset.bound = 'true';
}

async function handleDepartmentPasswordUpdate(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    department_id: Number(formData.get('department_id')),
    email: String(formData.get('email') || '').trim().toLowerCase(),
    new_password: String(formData.get('new_password') || '')
  };

  if (!payload.department_id || !payload.email || !payload.new_password) {
    showErrorToast('Department, email, and new password are required');
    return;
  }

  try {
    const response = await getApiClient().updateDepartmentPassword(payload);
    const result = document.getElementById('admin-manage-department-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Password updated for ${data.email || payload.email} (${data.department?.name || 'department'}).`;
    }
    form.reset();
    showErrorToast('Department password updated successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to update department password');
  }
}

async function handleDashboardPasswordUpdate(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    username: String(formData.get('username') || '').trim(),
    new_password: String(formData.get('new_password') || '')
  };

  if (!payload.username || !payload.new_password) {
    showErrorToast('Username and new password are required');
    return;
  }

  try {
    const response = await getApiClient().updateDashboardPassword(payload);
    const result = document.getElementById('admin-manage-dashboard-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Dashboard password updated for ${data.username || payload.username}.`;
    }
    form.reset();
    showErrorToast('Dashboard password updated successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to update dashboard password');
  }
}

async function handleDepartmentCreate(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim()
  };

  if (!payload.name) {
    showErrorToast('Department name is required');
    return;
  }

  try {
    const response = await getApiClient().createDepartment(payload);
    const result = document.getElementById('admin-department-management-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Department ${data.name || payload.name} created.`;
    }
    form.reset();
    await loadAdminDepartmentOptions();
    showErrorToast('Department created successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to create department');
  }
}

async function handleDepartmentDelete(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const departmentId = String(formData.get('department_id') || '').trim();

  if (!departmentId) {
    showErrorToast('Please select a department to remove');
    return;
  }

  try {
    const response = await getApiClient().deleteDepartment(departmentId);
    const result = document.getElementById('admin-department-management-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Department ${data.name || data.slug || departmentId} removed.`;
    }
    form.reset();
    await loadAdminDepartmentOptions();
    showErrorToast('Department removed successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to remove department');
  }
}

async function handleDashboardUserCreate(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    email: String(formData.get('email') || '').trim().toLowerCase(),
    password: String(formData.get('password') || '')
  };

  if (!payload.email || !payload.password) {
    showErrorToast('Email and password are required');
    return;
  }

  try {
    const response = await getApiClient().createDashboardUser(payload);
    const result = document.getElementById('admin-dashboard-user-management-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Dashboard user ${data.email || payload.email} created.`;
    }
    form.reset();
    showErrorToast('Dashboard user created successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to create dashboard user');
  }
}

async function handleDashboardUserDelete(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const email = String(formData.get('email') || '').trim().toLowerCase();

  if (!email) {
    showErrorToast('Please provide dashboard email to remove');
    return;
  }

  try {
    const response = await getApiClient().deleteDashboardUser(email);
    const result = document.getElementById('admin-dashboard-user-management-result');
    const data = response?.data || {};
    if (result) {
      result.textContent = `Dashboard user ${data.email || email} removed.`;
    }
    form.reset();
    showErrorToast('Dashboard user removed successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to remove dashboard user');
  }
}

async function handleAdminLogout() {
  try {
    await getApiClient().adminLogout();
  } catch (error) {
    // Continue local logout state even if API call fails.
  }

  navigateToPage('admin');
  showErrorToast('Logged out.');
}
