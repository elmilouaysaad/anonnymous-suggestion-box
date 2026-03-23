/**
 * Admin Dashboard
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

async function loadAdminDashboard() {
  setupAdminDepartmentUserForm();
  setupAdminDepartmentCreateForm();
  await loadAdminDepartmentOptions();
  await refreshAdminDashboard();
}

async function refreshAdminDashboard() {
  try {
    const [analyticsResponse, keywordsResponse, submissionsResponse, engagementTrendResponse] = await Promise.all([
      getApiClient().getAnalytics(),
      getApiClient().getKeywordAnalysis({ limit: 100 }),
      getApiClient().getAdminSubmissions({ page: 1, limit: 500 }),
      getApiClient().getEngagementTrend(14)
    ]);

    const analytics = analyticsResponse?.data || {};
    const submissions = submissionsResponse?.data?.submissions || [];
    const sla = computeSlaMetrics(submissions, 14);

    renderAdminOverview(analytics, sla);
    renderAdminDepartmentPerformance(analytics?.department_performance || [], submissions, sla.byDepartment);
    renderAdminKeywords(keywordsResponse?.data?.keywords || []);
    renderEngagementLineChart(engagementTrendResponse?.data?.points || []);
  } catch (error) {
    if (String(error.message || '').includes('401')) {
      showErrorToast('Session expired. Please log in again.');
      navigateToPage('admin');
      return;
    }
    showErrorToast(error.message || 'Failed to load admin dashboard');
  }
}

function renderAdminOverview(data, sla) {
  const container = document.getElementById('admin-overview-cards');
  if (!container) {
    return;
  }

  const overview = data.overview || {};
  const helpfulness = data.helpfulness || {};

  const cards = [
    { label: 'Total', value: overview.total_submissions || 0 },
    { label: 'Pending', value: overview.pending_submissions || 0 },
    { label: 'Answered', value: overview.answered_submissions || 0 },
    { label: 'Hidden', value: overview.hidden_submissions || 0 },
    { label: 'Helpful %', value: `${helpfulness.helpful_percentage || 0}%` },
    { label: 'Late > 2 Weeks', value: sla?.lateFeedback || 0 },
    { label: 'No Feedback > 2 Weeks', value: sla?.noFeedback || 0 }
  ];

  container.innerHTML = cards
    .map((card) => `<div class="stat-card"><h4>${card.label}</h4><p>${card.value}</p></div>`)
    .join('');
}

function renderAdminDepartmentPerformance(rows, submissions, slaByDepartment) {
  const container = document.getElementById('admin-department-performance');
  if (!container) {
    return;
  }

  if (!rows.length) {
    container.innerHTML = '<p class="subtle">No department data available.</p>';
    return;
  }

  const sentimentByDepartment = computeDepartmentSentiments(submissions);
  const hiddenByDepartment = computeHiddenByDepartment(submissions);

  const tableRows = rows
    .map((row) => {
      const total = Number(row.total_submissions || 0);
      const answered = Number(row.answered_count || 0);
      const hidden = hiddenByDepartment.get(String(row.id)) || 0;
      const rate = total > 0 ? Math.round((answered / total) * 100) : 0;
      const sentiment = sentimentByDepartment.get(String(row.id)) || {
        Positive: 0,
        Neutral: 0,
        Negative: 0
      };
      const sentimentTotal = sentiment.Positive + sentiment.Neutral + sentiment.Negative;
      const sentimentScore = toSentimentScore(sentiment, sentimentTotal);
      const sla = (slaByDepartment && slaByDepartment.get(String(row.id))) || { lateFeedback: 0, noFeedback: 0 };

      return `<tr>
        <td>${escapeHtml(row.name || '-')}</td>
        <td>${total}</td>
        <td>${answered}</td>
        <td>${hidden}</td>
        <td>${rate}%</td>
        <td>${sentimentScore}%</td>
        <td>${sla.lateFeedback}</td>
        <td>${sla.noFeedback}</td>
      </tr>`;
    })
    .join('');

  container.innerHTML = `
    <table class="mini-table">
      <thead>
        <tr>
          <th>Department</th>
          <th>Total</th>
          <th>Answered</th>
          <th>Hidden</th>
          <th>Rate</th>
          <th>Sentiment</th>
          <th>Late > 2w</th>
          <th>No Feedback > 2w</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}

function renderAdminKeywords(keywords) {
  const container = document.getElementById('admin-keywords');
  if (!container) {
    return;
  }

  if (!keywords.length) {
    container.innerHTML = '<p class="subtle">No keyword data available.</p>';
    return;
  }

  const topKeywords = keywords.slice(0, 90);
  const maxCount = Math.max(...topKeywords.map((item) => Number(item.count || 0)), 1);
  const centerIndex = 0;

  container.innerHTML = `
    <div class="keyword-masonry">
      ${topKeywords
    .map((item, index) => {
      const count = Number(item.count || 0);
      const scale = count / maxCount;
      const fontSize = Math.round(10 + scale * 9);
      const opacity = (0.6 + scale * 0.4).toFixed(2);
      const span = scale > 0.8 ? 3 : scale > 0.5 ? 2 : 1;
      const centerClass = index === centerIndex ? 'keyword-masonry-center' : '';
      return `<span class="keyword-cloud-item keyword-masonry-item ${centerClass}" style="font-size:${fontSize}px;opacity:${opacity};--span:${span};" title="${count} mentions" data-count="${count} mentions">${escapeHtml(item.keyword)}</span>`;
    })
    .join('')}
    </div>
  `;
}

function renderEngagementLineChart(points) {
  const container = document.getElementById('admin-engagement-line');
  if (!container) {
    return;
  }

  if (!Array.isArray(points) || !points.length) {
    container.innerHTML = '<p class="subtle">No engagement activity recorded yet.</p>';
    return;
  }

  const width = 800;
  const height = 220;
  const padLeft = 38;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 28;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxCount = Math.max(...points.map((point) => Number(point.count || 0)), 1);
  const minCount = 0;
  const span = Math.max(1, points.length - 1);

  const coords = points.map((point, index) => {
    const count = Number(point.count || 0);
    const x = padLeft + (index / span) * chartWidth;
    const y = padTop + chartHeight - ((count - minCount) / (maxCount - minCount || 1)) * chartHeight;
    return {
      x,
      y,
      count,
      date: point.date
    };
  });

  const polylinePoints = coords.map((coord) => `${coord.x.toFixed(2)},${coord.y.toFixed(2)}`).join(' ');
  const areaPoints = [
    `${padLeft},${padTop + chartHeight}`,
    ...coords.map((coord) => `${coord.x.toFixed(2)},${coord.y.toFixed(2)}`),
    `${padLeft + chartWidth},${padTop + chartHeight}`
  ].join(' ');

  const firstDate = points[0]?.date || '';
  const lastDate = points[points.length - 1]?.date || '';

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="engagement-line-svg" role="img" aria-label="Engagement trend over time">
      <line x1="${padLeft}" y1="${padTop + chartHeight}" x2="${padLeft + chartWidth}" y2="${padTop + chartHeight}" class="line-axis"></line>
      <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + chartHeight}" class="line-axis"></line>
      <polygon points="${areaPoints}" class="line-area"></polygon>
      <polyline points="${polylinePoints}" class="line-path"></polyline>
      ${coords
        .map((coord) => `
          <g>
            <circle cx="${coord.x.toFixed(2)}" cy="${coord.y.toFixed(2)}" r="3" class="line-dot"></circle>
            <title>${coord.date}: ${coord.count} engagements</title>
          </g>
        `)
        .join('')}
      <text x="${padLeft}" y="${height - 6}" class="line-label">${escapeHtml(firstDate)}</text>
      <text x="${padLeft + chartWidth}" y="${height - 6}" text-anchor="end" class="line-label">${escapeHtml(lastDate)}</text>
      <text x="${padLeft - 8}" y="${padTop + 6}" text-anchor="end" class="line-label">${maxCount}</text>
      <text x="${padLeft - 8}" y="${padTop + chartHeight + 4}" text-anchor="end" class="line-label">0</text>
    </svg>
  `;
}

function renderBarRows(points) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return points
    .map((point) => {
      const width = Math.round((point.value / max) * 100);
      return `
        <div class="bar-row">
          <span class="bar-label">${escapeHtml(point.label)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${width}%;"></div></div>
          <span class="bar-value">${point.value}</span>
        </div>
      `;
    })
    .join('');
}

function computeDepartmentSentiments(submissions) {
  const map = new Map();

  submissions.forEach((submission) => {
    const departmentId = String(submission?.Department?.id || submission?.department_id || '');
    if (!departmentId) {
      return;
    }

    const sentiment = String(submission?.sentiment || '').trim();
    if (!map.has(departmentId)) {
      map.set(departmentId, { Positive: 0, Neutral: 0, Negative: 0 });
    }

    const bucket = map.get(departmentId);
    if (sentiment === 'Positive' || sentiment === 'Neutral' || sentiment === 'Negative') {
      bucket[sentiment] += 1;
    }
  });

  return map;
}

function computeHiddenByDepartment(submissions) {
  const map = new Map();

  submissions.forEach((submission) => {
    if (submission?.status !== 'Hidden') {
      return;
    }

    const departmentId = String(submission?.Department?.id || submission?.department_id || '');
    if (!departmentId) {
      return;
    }

    map.set(departmentId, (map.get(departmentId) || 0) + 1);
  });

  return map;
}

function computeSlaMetrics(submissions, thresholdDays) {
  const now = Date.now();
  const thresholdMs = Number(thresholdDays || 14) * 24 * 60 * 60 * 1000;

  let lateFeedback = 0;
  let noFeedback = 0;
  const byDepartment = new Map();

  submissions.forEach((submission) => {
    const departmentId = String(submission?.Department?.id || submission?.department_id || '');
    const submittedAt = submission?.submission_date ? new Date(submission.submission_date).getTime() : null;

    if (!departmentId || !submittedAt || Number.isNaN(submittedAt)) {
      return;
    }

    if (!byDepartment.has(departmentId)) {
      byDepartment.set(departmentId, { lateFeedback: 0, noFeedback: 0 });
    }

    const bucket = byDepartment.get(departmentId);
    const answerDates = Array.isArray(submission?.Answers)
      ? submission.Answers
        .map((answer) => (answer?.answered_date ? new Date(answer.answered_date).getTime() : null))
        .filter((timestamp) => Number.isFinite(timestamp))
      : [];
    const earliestAnsweredAt = answerDates.length ? Math.min(...answerDates) : null;

    if (earliestAnsweredAt) {
      if (earliestAnsweredAt - submittedAt > thresholdMs) {
        lateFeedback += 1;
        bucket.lateFeedback += 1;
      }
      return;
    }

    if (submission?.status === 'Pending' && now - submittedAt > thresholdMs) {
      noFeedback += 1;
      bucket.noFeedback += 1;
    }
  });

  return {
    lateFeedback,
    noFeedback,
    byDepartment
  };
}

function toPercent(part, total) {
  if (!total) {
    return 0;
  }

  return Math.round((Number(part || 0) / Number(total || 1)) * 100);
}

function toSentimentScore(sentiment, total) {
  if (!total) {
    return 0;
  }

  const weighted = (sentiment.Positive * 100) + (sentiment.Neutral * 50) + (sentiment.Negative * 0);
  return Math.round(weighted / total);
}

function setupAdminDepartmentUserForm() {
  const form = document.getElementById('admin-create-department-user-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleAdminCreateDepartmentUser);
  form.dataset.bound = 'true';
}

function setupAdminDepartmentCreateForm() {
  const form = document.getElementById('admin-create-department-form');
  if (!form || form.dataset.bound === 'true') {
    return;
  }

  form.addEventListener('submit', handleAdminCreateDepartment);
  form.dataset.bound = 'true';
}

async function loadAdminDepartmentOptions() {
  const select = document.getElementById('admin-dept-select');
  if (!select) {
    return;
  }

  try {
    const response = await getApiClient().getDepartments();
    const departments = response?.data || [];

    select.innerHTML = '<option value="">-- Select Department --</option>';
    departments.forEach((department) => {
      const option = document.createElement('option');
      option.value = department.id;
      option.textContent = department.name;
      select.appendChild(option);
    });
  } catch (error) {
    showErrorToast(error.message || 'Failed to load departments for admin form');
  }
}

async function handleAdminCreateDepartmentUser(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    department_id: Number(formData.get('department_id')),
    password: String(formData.get('password') || ''),
    email: String(formData.get('email') || '').trim().toLowerCase()
  };

  if (!payload.department_id || !payload.email || !payload.password) {
    showErrorToast('Department, email, and password are required');
    return;
  }

  try {
    const response = await getApiClient().createDepartmentUser(payload);
    const result = document.getElementById('admin-create-user-result');
    const created = response?.data || {};
    if (result) {
      result.textContent = `Created login ${created.email || payload.email} for ${created.department?.name || 'selected department'}.`;
    }
    form.reset();
    showErrorToast('Department credentials created successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to create department credentials');
  }
}

async function handleAdminCreateDepartment(event) {
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
    const result = document.getElementById('admin-create-department-result');
    const created = response?.data || {};
    if (result) {
      result.textContent = `Department ${created.name || payload.name} created.`;
    }
    form.reset();
    await loadAdminDepartmentOptions();
    showErrorToast('Department created successfully');
  } catch (error) {
    showErrorToast(error.message || 'Failed to create department');
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
