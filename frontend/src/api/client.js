/**
 * API Client
 * Handles all HTTP requests to the backend
 */

const resolveApiBaseUrl = () => {
  const configured =
    (typeof process !== 'undefined' &&
      process.env &&
      process.env.REACT_APP_API_URL) ||
    globalThis.REACT_APP_API_URL ||
    'http://localhost:3000/api';
  const trimmed = configured.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.sessionId = this.getOrCreateSessionId();
    this.departmentToken = localStorage.getItem('departmentSessionId') || null;
    this.adminToken = localStorage.getItem('adminSessionId') || null;
  }

  /**
   * Get or create a session ID for tracking user votes
   */
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate a UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Make a fetch request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: 'Network error' }
        }));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * PUBLIC API Methods
   */

  /**
   * Get all departments
   */
  async getDepartments() {
    return this.request('/public/departments');
  }

  /**
   * Get submissions for a department
   */
  async getSubmissions(options = {}) {
    const params = new URLSearchParams();
    if (options.department) params.append('department', options.department);
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.sort) params.append('sort', options.sort);

    const queryString = params.toString();
    const endpoint = `/public/submissions${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  /**
   * Submit new feedback
   */
  async submitFeedback(data) {
    return this.request('/public/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Record helpfulness feedback
   */
  async submitHelpfulness(data) {
    return this.request('/public/helpfulness', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_session_id: this.sessionId
      })
    });
  }

  /**
   * DEPARTMENT API Methods
   */

  /**
   * Department login
   */
  async departmentLogin(email, password) {
    const response = await this.request('/department/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const token = response?.data?.session_id;
    if (token) {
      this.departmentToken = token;
      localStorage.setItem('departmentSessionId', token);
    }

    return response;
  }

  /**
   * Get department submissions
   */
  async getDepartmentSubmissions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/department/submissions${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint, {
      headers: {
        'X-Session-ID': this.departmentToken || ''
      }
    });
  }

  /**
   * Submit an answer to a submission
   */
  async submitAnswer(submissionId, answerText) {
    return this.request(`/department/submissions/${submissionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ text: answerText }),
      headers: {
        'X-Session-ID': this.departmentToken || ''
      }
    });
  }

  /**
   * Hide a submission
   */
  async hideSubmission(submissionId) {
    return this.request(`/department/submissions/${submissionId}/hide`, {
      method: 'POST',
      headers: {
        'X-Session-ID': this.departmentToken || ''
      }
    });
  }

  /**
   * Department logout
   */
  async departmentLogout() {
    const response = await this.request('/department/logout', {
      method: 'POST',
      headers: {
        'X-Session-ID': this.departmentToken || ''
      }
    });

    this.departmentToken = null;
    localStorage.removeItem('departmentSessionId');
    return response;
  }

  /**
   * ADMIN API Methods
   */

  /**
   * Admin login
   */
  async adminLogin(username, password) {
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    const token = response?.data?.session_id;
    if (token) {
      this.adminToken = token;
      localStorage.setItem('adminSessionId', token);
    }

    return response;
  }

  /**
   * Get admin analytics
   */
  async getAnalytics(filters = {}) {
    const params = new URLSearchParams();
    if (filters.departmentId) params.append('department_id', filters.departmentId);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);

    const queryString = params.toString();
    const endpoint = `/admin/analytics${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint, {
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Get all submissions (admin view)
   */
  async getAdminSubmissions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.sentiment) params.append('sentiment', filters.sentiment);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/admin/submissions${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint, {
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Get keyword analysis
   */
  async getKeywordAnalysis(filters = {}) {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/admin/keywords${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint, {
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Get engagement trend (admin)
   */
  async getEngagementTrend(days = 14) {
    return this.request(`/admin/engagement-trend?days=${encodeURIComponent(days)}`, {
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Create department credentials (admin)
   */
  async createDepartmentUser(payload) {
    return this.request('/admin/department-users', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Create department (admin)
   */
  async createDepartment(payload) {
    return this.request('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Delete department (superadmin)
   */
  async deleteDepartment(departmentId) {
    return this.request(`/admin/departments/${encodeURIComponent(departmentId)}`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Update department user password (superadmin)
   */
  async updateDepartmentPassword(payload) {
    return this.request('/admin/department-users/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Update dashboard user password (superadmin)
   */
  async updateDashboardPassword(payload) {
    return this.request('/admin/dashboard-users/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Create dashboard user (superadmin)
   */
  async createDashboardUser(payload) {
    return this.request('/admin/dashboard-users', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Remove dashboard user (superadmin)
   */
  async deleteDashboardUser(username) {
    return this.request(`/admin/dashboard-users/${encodeURIComponent(username)}`, {
      method: 'DELETE',
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });
  }

  /**
   * Admin logout
   */
  async adminLogout() {
    const response = await this.request('/admin/logout', {
      method: 'POST',
      headers: {
        'X-Session-ID': this.adminToken || ''
      }
    });

    this.adminToken = null;
    localStorage.removeItem('adminSessionId');
    return response;
  }
}

// Create a singleton instance
const apiClient = new ApiClient();
globalThis.ApiClient = ApiClient;
globalThis.apiClient = apiClient;
