// API base URL
const API_BASE = window.location.origin;

// Tab navigation
document.querySelectorAll('[data-tab]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = e.target.dataset.tab;
    
    // Update active link
    document.querySelectorAll('[data-tab]').forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
    
    // Show/hide tabs
    document.getElementById('submit-tab').style.display = tab === 'submit' ? 'block' : 'none';
    document.getElementById('dashboard-tab').style.display = tab === 'dashboard' ? 'block' : 'none';
    
    // Load dashboard if needed
    if (tab === 'dashboard') {
      loadDashboard();
    }
  });
});

// Star rating interaction
let selectedRating = 0;
const stars = document.querySelectorAll('.star-rating .star');

stars.forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.rating);
    document.getElementById('rating').value = selectedRating;
    updateStars(selectedRating);
  });
  
  star.addEventListener('mouseenter', () => {
    updateStars(parseInt(star.dataset.rating));
  });
});

document.querySelector('.star-rating').addEventListener('mouseleave', () => {
  updateStars(selectedRating);
});

function updateStars(rating) {
  stars.forEach(star => {
    const starRating = parseInt(star.dataset.rating);
    if (starRating <= rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Form submission
document.getElementById('feedback-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const messageDiv = document.getElementById('form-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  if (!selectedRating) {
    showMessage('Please select a rating', 'error');
    return;
  }
  
  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
    rating: selectedRating
  };
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
  
  try {
    const response = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showMessage('Thank you for your feedback!', 'success');
      e.target.reset();
      selectedRating = 0;
      updateStars(0);
    } else {
      showMessage(result.error || 'Failed to submit feedback', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showMessage('Network error. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send me-2" viewBox="0 0 16 16">
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.812 13.414a.5.5 0 0 1-.906-.11L6.5 9.5 2.086 13.88a.5.5 0 0 1-.77-.528l5.812-13.414a.5.5 0 0 1 .906.11L10.5 4.5l4.414-4.354a.5.5 0 0 1 .94.002Z"/>
      </svg>
      Submit Feedback
    `;
  }
});

function showMessage(text, type) {
  const messageDiv = document.getElementById('form-message');
  messageDiv.textContent = text;
  messageDiv.className = type;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Dashboard functions
async function loadDashboard() {
  try {
    await Promise.all([
      loadStats(),
      loadFeedback()
    ]);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    const stats = await response.json();
    
    document.getElementById('total-feedback').textContent = stats.total;
    document.getElementById('avg-rating').textContent = stats.averageRating;
    
    const fiveStarItem = stats.ratingDistribution.find(item => item.rating === 5);
    document.getElementById('five-star-count').textContent = fiveStarItem ? fiveStarItem.count : 0;
    
    renderChart(stats.ratingDistribution);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function renderChart(distribution) {
  const chartContainer = document.getElementById('rating-chart');
  const maxCount = Math.max(...distribution.map(item => item.count), 1);
  
  const chartHTML = `
    <div class="bar-chart">
      ${distribution.map(item => {
        const height = (item.count / maxCount) * 200;
        const stars = '★'.repeat(item.rating);
        return `
          <div class="bar-wrapper">
            <div class="bar" style="height: ${Math.max(height, 5)}px;">
              <div class="bar-count">${item.count}</div>
            </div>
            <div class="bar-label">
              <div class="stars">${stars}</div>
              <div>${item.rating}/5</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  chartContainer.innerHTML = chartHTML;
}

async function loadFeedback() {
  const filter = document.getElementById('rating-filter').value;
  const url = filter 
    ? `${API_BASE}/api/feedback?rating=${filter}`
    : `${API_BASE}/api/feedback`;
  
  try {
    const response = await fetch(url);
    const feedbacks = await response.json();
    
    renderFeedbackList(feedbacks);
  } catch (error) {
    console.error('Error loading feedback:', error);
  }
}

function renderFeedbackList(feedbacks) {
  const listContainer = document.getElementById('feedback-list');
  
  if (feedbacks.length === 0) {
    listContainer.innerHTML = `
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle me-2" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z"/>
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/>
        </svg>
        No feedback yet. Be the first to share!
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = feedbacks.map(item => {
    const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    const date = new Date(item.created_at).toLocaleString();
    
    return `
      <div class="card feedback-card rating-${item.rating} mb-3 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="mb-1">
                <strong>${escapeHtml(item.name)}</strong>
                ${item.email ? `<small class="text-muted">(${escapeHtml(item.email)})</small>` : ''}
              </h6>
              <div class="text-warning">${stars}</div>
            </div>
            <small class="text-muted">${date}</small>
          </div>
          <p class="mb-0">${escapeHtml(item.message)}</p>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Filter and refresh
document.getElementById('rating-filter').addEventListener('change', loadFeedback);
document.getElementById('refresh-btn').addEventListener('click', loadDashboard);
