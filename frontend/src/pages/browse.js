/**
 * Browse Page
 * Displays answered submissions and allows browsing by department
 */

let currentPage = 1;
let currentDepartment = null;
let currentSort = 'newest';
const ITEMS_PER_PAGE = 10;

function isGeneralSlug(slug) {
  const normalized = String(slug || '').trim().toLowerCase();
  return normalized === 'general' || normalized === 'genral';
}

function getApiClient() {
  if (!globalThis.apiClient && globalThis.ApiClient) {
    globalThis.apiClient = new globalThis.ApiClient();
  }
  if (!globalThis.apiClient) {
    throw new Error('API client is not initialized');
  }
  return globalThis.apiClient;
}

async function loadBrowsePage() {
  try {
    // Load departments first
    const deptResponse = await getApiClient().getDepartments();
    populateBrowseDepartments(deptResponse.data || []);

    // Load initial submissions (all departments)
    if (!currentDepartment || currentDepartment === null) {
      currentDepartment = 'general';
      document.getElementById('tag-title').textContent = 'Answers about: General';
    }
    await loadAndDisplaySubmissions();
  } catch (error) {
    console.error('Failed to load browse page:', error);
    showErrorToast('Failed to load submissions');
  }
}

async function loadBrowsePageWithDepartment(slug, name) {
  currentDepartment = slug;
  currentPage = 1;
  document.getElementById('tag-title').textContent = `Answers about: ${name}`;
  
  // Highlight the correct department button (departments already populated by loadBrowsePage)
  document.querySelectorAll('#departments-feed .tag-button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === name || (isGeneralSlug(slug) && btn.textContent === 'General')) {
      btn.classList.add('active');
    }
  });
  
  await loadAndDisplaySubmissions();
}

function populateBrowseDepartments(departments) {
  const container = document.getElementById('departments-feed');
  if (!container) return;

  container.innerHTML = '';

  const generalButton = document.createElement('button');
  generalButton.className = 'tag-button';
  generalButton.textContent = 'General';
  if (isGeneralSlug(currentDepartment)) {
    generalButton.classList.add('active');
  }
  generalButton.onclick = (e) => {
    e.preventDefault();
    selectBrowseDepartment('general', 'General', e.currentTarget);
  };
  container.appendChild(generalButton);
  
  if (!departments || departments.length === 0) {
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
    if (dept.slug === currentDepartment) {
      button.classList.add('active');
    }
    button.onclick = (e) => {
      e.preventDefault();
      selectBrowseDepartment(dept.slug, dept.name, e.currentTarget);
    };
    container.appendChild(button);
  });
}

function selectBrowseDepartment(slug, name, buttonEl) {
  currentDepartment = slug;
  currentPage = 1;
  document.getElementById('tag-title').textContent = `Answers about: ${name}`;
  
  // Update active button
  document.querySelectorAll('#departments-feed .tag-button').forEach(btn => {
    btn.classList.remove('active');
  });
  if (buttonEl) {
    buttonEl.classList.add('active');
  }

  loadAndDisplaySubmissions();
}

async function loadAndDisplaySubmissions() {
  try {
    const response = await getApiClient().getSubmissions({
      department: currentDepartment,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sort: currentSort
    });

    const submissions = response?.data?.submissions || [];
    const pagination = response?.data?.pagination || {};

    displaySubmissions(submissions);
    displayPagination(pagination);
  } catch (error) {
    console.error('Failed to load submissions:', error);
    showErrorToast('Failed to load submissions');
  }
}

function displaySubmissions(submissions) {
  const container = document.getElementById('submissions-list');
  if (!container) return;

  if (!submissions || submissions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">No Items</div>
        <p>No answered submissions yet</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  
  submissions.forEach(submission => {
    const card = createSubmissionCard(submission);
    container.appendChild(card);
  });
}

function formatAnswerSegment(text) {
  return escapeHtml(String(text || '').trim()).replace(/\n/g, '<br>');
}

function renderAnswerHistory(answerText) {
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
    return `<div class="answer-history-item"><div class="answer-history-text">${formatAnswerSegment(rawText)}</div></div>`;
  }

  return `<div class="answer-history">${blocks.join('')}</div>`;
}

function createSubmissionCard(submission) {
  const card = document.createElement('div');
  card.className = 'submission-card';

  // Category badge
  const badgeClass = `badge-${submission.category.toLowerCase()}`;
  const categoryBadge = `<span class="submission-badge ${badgeClass}">${submission.category}</span>`;

  // Format date
  const date = new Date(submission.submission_date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Answer section
  let answerHTML = '';
  const answer = submission.answer || submission.Answer;
  if (answer) {
    answerHTML = `
      <div class="answer-section">
        <h4>Official Answer</h4>
        ${renderAnswerHistory(answer.text)}
        <div class="answer-meta">
          Answered on ${new Date(answer.answered_date).toLocaleDateString()}
        </div>
      </div>
    `;
  }

  // Helpfulness section
  const totalVotes = submission.helpfulness?.total_votes || 0;
  const helpfulVotes = submission.helpfulness?.helpful_count || 0;
  const helpfulPercent = totalVotes > 0
    ? Math.round((helpfulVotes / totalVotes) * 100)
    : 0;

  const helpfulnessHTML = `
    <div class="helpfulness-section">
      <div class="helpfulness-stats">
        ${helpfulVotes} of ${totalVotes} people found this helpful (${helpfulPercent}%)
      </div>
      <div class="helpfulness-buttons">
        <button class="helpfulness-btn helpfulness-btn-positive" data-answer-id="${answer?.id}" data-submission-id="${submission.id}" data-helpful="true" title="Helpful">
          😊 Helpful
        </button>
        <button class="helpfulness-btn helpfulness-btn-negative" data-answer-id="${answer?.id}" data-submission-id="${submission.id}" data-helpful="false" title="Not Helpful">
          😞 Not Helpful
        </button>
      </div>
    </div>
  `;

  card.innerHTML = `
    <div class="submission-header">
      <div class="submission-meta">
        ${categoryBadge}
        <span>${formattedDate}</span>
      </div>
    </div>
    
    <p class="submission-text">${escapeHtml(submission.text.substring(0, 200))}${submission.text.length > 200 ? '...' : ''}</p>
    
    ${answerHTML}
    
    ${answer ? helpfulnessHTML : '<p class="subtle">Awaiting answer</p>'}
  `;

  // Add event listeners for helpfulness buttons
  if (answer) {
    card.querySelectorAll('.helpfulness-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        handleHelpfulnessVote(
          this.dataset.submissionId,
          this.dataset.answerId,
          this.dataset.helpful === 'true',
          this
        );
      });
    });
  }

  return card;
}

async function handleHelpfulnessVote(submissionId, answerId, isHelpful, buttonEl) {
  try {
    await getApiClient().submitHelpfulness({
      submission_id: parseInt(submissionId),
      answer_id: parseInt(answerId),
      is_helpful: isHelpful
    });

    // Mark as voted
    buttonEl.classList.add('voted');
    buttonEl.disabled = true;

    // Show feedback
    showErrorToast('Thank you for your feedback!');
  } catch (error) {
    showErrorToast('Failed to record vote');
  }
}

function displayPagination(pagination) {
  const container = document.getElementById('pagination');
  if (!container) return;

  container.innerHTML = '';

  const totalPages = pagination.total_pages || Math.ceil((pagination.total_items || 0) / ITEMS_PER_PAGE);

  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.textContent = '← Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadAndDisplaySubmissions();
      window.scrollTo(0, 0);
    }
  };
  container.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    if (i === currentPage) btn.classList.add('active');
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      loadAndDisplaySubmissions();
      window.scrollTo(0, 0);
    };
    container.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadAndDisplaySubmissions();
      window.scrollTo(0, 0);
    }
  };
  container.appendChild(nextBtn);
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
