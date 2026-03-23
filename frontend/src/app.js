/**
 * Main Application
 * Handles page navigation, modal management, and global event listeners
 */

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function getApiClient() {
  if (!globalThis.apiClient && globalThis.ApiClient) {
    globalThis.apiClient = new globalThis.ApiClient();
  }
  if (!globalThis.apiClient) {
    throw new Error('API client is not initialized');
  }
  return globalThis.apiClient;
}

function initializeApp() {
  setupNavigationListeners();
  setupSecretAccess();
  setupFormValidation();
  loadInitialData();
}

/**
 * Navigation
 */
function setupNavigationListeners() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      // Only prevent defaults if it's a client-side navigation
      if (this.href === '#') {
        e.preventDefault();
      }
      
      const page = this.dataset.page;
      if (page) {
        e.preventDefault();
        navigateToPage(page);
      }
    });
  });
}

function setupSecretAccess() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      navigateToPage('department');
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      navigateToPage('admin');
    }
  });
}

function navigateToPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show selected page
  const selectedPage = document.getElementById(`${pageName}-page`);
  if (selectedPage) {
    selectedPage.classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    // Load page-specific data
    if (pageName === 'submit') {
      loadDepartmentsForForm();
    } else if (pageName === 'browse') {
      loadBrowsePage();
    } else if (pageName === 'department-dashboard') {
      loadDepartmentDashboard();
    } else if (pageName === 'admin-dashboard') {
      loadAdminDashboard();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }
}

/**
 * Form Validation & Submission
 */
function setupFormValidation() {
  // Feedback form
  const feedbackForm = document.getElementById('submission-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
  }

  // Department login form
  const deptLoginForm = document.getElementById('department-login-form');
  if (deptLoginForm) {
    deptLoginForm.addEventListener('submit', handleDepartmentLogin);
  }

  // Admin login form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
}

/**
 * Form Handlers
 */
async function handleFeedbackSubmit(e) {
  e.preventDefault();

  // Validate form
  const department = document.getElementById('department').value;
  const category = document.querySelector('input[name="category"]:checked')?.value;
  const text = document.getElementById('feedback').value.trim();

  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

  let isValid = true;

  if (!department) {
    document.getElementById('department-error').textContent = 'Please select a department';
    isValid = false;
  }

  if (!category) {
    document.getElementById('category-error').textContent = 'Please select a feedback type';
    isValid = false;
  }

  if (!text) {
    document.getElementById('feedback-error').textContent = 'Please provide feedback text';
    isValid = false;
  }

  if (!isValid) return;

  try {
    // Submit feedback
    await getApiClient().submitFeedback({
      text,
      category,
      department_id: parseInt(department)
    });

    // Show success modal
    showModal();

    // Reset form
    e.target.reset();
  } catch (error) {
    showErrorToast(error.message || 'Failed to submit feedback');
  }
}

async function handleDepartmentLogin(e) {
  e.preventDefault();

  const email = document.getElementById('dept-email').value.trim().toLowerCase();
  const password = document.getElementById('dept-password').value;

  if (!email || !password) {
    showErrorToast('Please enter email and password');
    return;
  }

  try {
    const response = await getApiClient().departmentLogin(email, password);
    
    // Store token if returned
    if (response?.data?.session_id) {
      localStorage.setItem('departmentSessionId', response.data.session_id);
    }

    navigateToPage('department-dashboard');
  } catch (error) {
    showErrorToast(error.message || 'Login failed');
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();

  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;

  if (!username || !password) {
    showErrorToast('Please enter username and password');
    return;
  }

  try {
    const response = await getApiClient().adminLogin(username, password);
    
    // Store token if returned
    if (response?.data?.session_id) {
      localStorage.setItem('adminSessionId', response.data.session_id);
    }

    navigateToPage('admin-dashboard');
  } catch (error) {
    showErrorToast(error.message || 'Login failed');
  }
}

/**
 * Load Initial Data
 */
async function loadInitialData() {
  try {
    const access = (new URLSearchParams(window.location.search).get('access') || '').toLowerCase();
    if (access === 'department' || access === 'dept') {
      navigateToPage('department');
      return;
    }

    if (access === 'admin') {
      navigateToPage('admin');
      return;
    }

    const hash = (window.location.hash || '').toLowerCase();
    if (hash === '#department' || hash === '#dept') {
      navigateToPage('department');
      return;
    }

    if (hash === '#admin') {
      navigateToPage('admin');
      return;
    }

    navigateToPage('submit');
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

/**
 * Modals & Toasts
 */
function showModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function showErrorToast(message) {
  const toast = document.getElementById('error-toast');
  const messageEl = document.getElementById('error-message');
  
  if (toast && messageEl) {
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      closeErrorToast();
    }, 5000);
  }
}

function closeErrorToast() {
  const toast = document.getElementById('error-toast');
  if (toast) {
    toast.classList.add('hidden');
  }
}

/**
 * Export functions for use in page modules
 */
