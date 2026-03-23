/**
 * Department Dashboard
 */

let departmentDashboardState = {
  status: '',
  submissions: []
};

function getApiClient() {
  if (!globalThis.apiClient && globalThis.ApiClient) {
    globalThis.apiClient = new globalThis.ApiClient();
  }
  if (!globalThis.apiClient) {
    throw new Error('API client is not initialized');
  }
  return globalThis.apiClient;
}

async function loadDepartmentDashboard() {
  const filterEl = document.getElementById('department-status-filter');
  if (filterEl && !filterEl.dataset.bound) {
    filterEl.addEventListener('change', async (event) => {
      departmentDashboardState.status = event.target.value;
      await refreshDepartmentDashboard();
    });
    filterEl.dataset.bound = 'true';
  }

  await refreshDepartmentDashboard();
}

async function refreshDepartmentDashboard() {
  try {
    const response = await getApiClient().getDepartmentSubmissions({
      status: departmentDashboardState.status,
      page: 1,
      limit: 50
    });

    const submissions = response?.data?.submissions || [];
    departmentDashboardState.submissions = submissions;
    renderDepartmentDashboard(submissions);
  } catch (error) {
    if (String(error.message || '').includes('401')) {
      showErrorToast('Session expired. Please log in again.');
      navigateToPage('department');
      return;
    }
    showErrorToast(error.message || 'Failed to load department dashboard');
  }
}

function renderDepartmentDashboard(submissions) {
  const container = document.getElementById('department-dashboard-list');
  if (!container) {
    return;
  }

  if (!submissions.length) {
    container.innerHTML = '<div class="panel"><p class="subtle">No submissions found for this filter.</p></div>';
    return;
  }

  container.innerHTML = '';

  const formatAnswerSegment = (text) =>
    escapeHtml(String(text || '').trim()).replace(/\n/g, '<br>');

  const renderAnswerHistory = (answerText) => {
    const rawText = String(answerText || '');
    const parts = rawText.split(/\n\n--- Updated: (.*?) ---\n/);
    const blocks = [];

    const original = (parts[0] || '').trim();
    if (original) {
      blocks.push(`
        <div class="answer-history-item">
          <div class="answer-history-meta">Original response</div>
          <div class="answer-history-text">${formatAnswerSegment(original)}</div>
        </div>
      `);
    }

    for (let index = 1; index < parts.length; index += 2) {
      const updatedAt = (parts[index] || '').trim();
      const updateText = (parts[index + 1] || '').trim();
      if (!updateText) {
        continue;
      }

      blocks.push(`
        <div class="answer-history-item">
          <div class="answer-history-meta">Update: ${escapeHtml(updatedAt || 'Recent')}</div>
          <div class="answer-history-text">${formatAnswerSegment(updateText)}</div>
        </div>
      `);
    }

    if (!blocks.length) {
      return formatAnswerSegment(rawText);
    }

    return `<div class="answer-history">${blocks.join('')}</div>`;
  };

  submissions.forEach((submission) => {
    const answer = submission.Answer || submission.answer;
    const isAnswered = submission.status === 'Answered' && !!answer;
    const isHidden = submission.status === 'Hidden';
    const card = document.createElement('div');
    card.className = 'submission-card department-card';

    const submittedAt = submission?.submission_date
      ? new Date(submission.submission_date).toLocaleDateString()
      : '-';

    card.innerHTML = `
      <div class="department-card-top">
        <div class="department-card-meta">
          <span class="submission-badge badge-${(submission.category || 'Suggestion').toLowerCase()}">${submission.category || 'Suggestion'}</span>
          <span class="pill">${submission.status}</span>
          <span class="subtle">${submittedAt}</span>
        </div>
      </div>
      <p class="submission-text">${escapeHtml(submission.text || '')}</p>
      ${answer ? `<div class="answer-preview"><strong>Current answer:</strong> ${renderAnswerHistory(answer.text || '')}</div>` : ''}
      <div class="answer-box">
        <textarea id="answer-${submission.id}" placeholder="${answer ? 'Add an update to the published answer...' : 'Write an official answer...'}"></textarea>
      </div>
      <div class="dashboard-item-actions department-card-actions">
        <button class="btn btn-success btn-sm" data-action="answer" data-id="${submission.id}">${isAnswered ? 'Update Answer' : 'Publish'}</button>
        ${isHidden ? '' : `<button class="btn btn-warning btn-sm" data-action="hide" data-id="${submission.id}">Hide</button>`}
      </div>
    `;

    card.querySelector('[data-action="answer"]').addEventListener('click', async () => {
      await handleDepartmentAnswer(submission.id);
    });

    const hideButton = card.querySelector('[data-action="hide"]');
    if (hideButton) {
      hideButton.addEventListener('click', async () => {
        await handleDepartmentHide(submission.id);
      });
    }

    container.appendChild(card);
  });
}

async function handleDepartmentAnswer(submissionId) {
  const textarea = document.getElementById(`answer-${submissionId}`);
  const text = (textarea?.value || '').trim();

  if (!text) {
    showErrorToast('Answer text is required.');
    return;
  }

  try {
    await getApiClient().submitAnswer(submissionId, text);
    showErrorToast('Answer saved and published.');
    await refreshDepartmentDashboard();
  } catch (error) {
    showErrorToast(error.message || 'Failed to save answer');
  }
}

async function handleDepartmentHide(submissionId) {
  try {
    await getApiClient().hideSubmission(submissionId);
    showErrorToast('Submission hidden.');
    await refreshDepartmentDashboard();
  } catch (error) {
    showErrorToast(error.message || 'Failed to hide submission');
  }
}

async function handleDepartmentLogout() {
  try {
    await getApiClient().departmentLogout();
  } catch (error) {
    // Continue local logout state even if API call fails.
  }

  navigateToPage('department');
  showErrorToast('Logged out.');
}
