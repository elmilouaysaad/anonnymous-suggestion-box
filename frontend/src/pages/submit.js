/**
 * Submit Page
 * Loads departments and populates tags
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

async function loadDepartmentsForForm() {
  try {
    const response = await getApiClient().getDepartments();
    
    // Populate select dropdown
    const select = document.getElementById('department');
    if (select && response.data) {
      select.innerHTML = '<option value="">-- Select Department --</option>';
      response.data.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        select.appendChild(option);
      });
    }

    // Populate feed tags
    populateDepartmentsTags(response.data);
  } catch (error) {
    console.error('Failed to load departments:', error);
    showErrorToast(`Failed to load departments: ${error.message || 'Unknown error'}`);
  }
}

function populateDepartmentsTags(departments) {
  const container = document.getElementById('departments-feed');
  if (!container) return;

  const isGeneralSlug = (slug) => {
    const normalized = String(slug || '').trim().toLowerCase();
    return normalized === 'general' || normalized === 'genral';
  };

  container.innerHTML = '';

  const generalButton = document.createElement('button');
  generalButton.className = 'tag-button';
  generalButton.textContent = 'General';
  generalButton.onclick = (e) => {
    e.preventDefault();
    navigateToTagPage('general', 'General');
  };
  container.appendChild(generalButton);
  
  if (!departments || departments.length === 0) {
    container.innerHTML = '<p class="subtle">No departments available</p>';
    return;
  }

  departments.forEach(dept => {
    // Skip General since we already added it manually
    if (isGeneralSlug(dept.slug)) {
      return;
    }
    
    const button = document.createElement('button');
    button.className = 'tag-button';
    button.textContent = dept.name;
    button.onclick = (e) => {
      e.preventDefault();
      navigateToTagPage(dept.slug, dept.name);
    };
    container.appendChild(button);
  });
}

function navigateToTagPage(slug, name) {
  navigateToPage('browse');
  loadBrowsePageWithDepartment(slug, name);
}
