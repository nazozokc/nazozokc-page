const CACHE_KEY_REPOS = 'github_repos';
const CACHE_EXPIRY = 5 * 60 * 1000;

function getCachedData(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
    }
  } catch {}
  return null;
}

function setCachedData(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getLanguageColor(lang) {
  const colors = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051'
  };
  return colors[lang] || '#858585';
}

async function loadRepositories() {
  const container = document.getElementById('reposContainer');
  if (!container) return;

  try {
    let repos;
    const cachedRepos = getCachedData(CACHE_KEY_REPOS);
    if (cachedRepos) {
      repos = cachedRepos;
    } else {
      const response = await fetch("https://api.github.com/users/nazozokc/repos?sort=updated&per_page=20");
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error('rate_limit');
        }
        throw new Error('network');
      }
      repos = await response.json();
      setCachedData(CACHE_KEY_REPOS, repos);
    }

    const filteredRepos = repos.filter(r => !r.fork).slice(0, 8);

    if (filteredRepos.length === 0) {
      container.innerHTML = '<p class="loading">No repositories found</p>';
      return;
    }

    container.innerHTML = filteredRepos.map(repo => `
      <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card">
        <div class="repo-name">${escapeHtml(repo.name)}</div>
        <p class="repo-desc">${escapeHtml(repo.description || 'No description')}</p>
        <div class="repo-meta">
          ${repo.language ? `
            <span class="repo-language">
              <span class="language-dot" style="background: ${getLanguageColor(repo.language)}"></span>
              ${escapeHtml(repo.language)}
            </span>
          ` : ''}
          <span>★ ${repo.stargazers_count}</span>
          <span>⑂ ${repo.forks_count}</span>
        </div>
      </a>
    `).join('');

  } catch (err) {
    if (err.message === 'rate_limit') {
      container.innerHTML = '<p class="error-msg">API rate limit exceeded. Please try again later.</p>';
    } else if (err.message === 'network') {
      container.innerHTML = '<p class="error-msg">Network error. Please check your connection.</p>';
    } else {
      container.innerHTML = '<p class="error-msg">Failed to load repositories</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRepositories();

  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'night') {
    document.documentElement.setAttribute('data-theme', 'night');
  }
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'night') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'day');
    } else {
      document.documentElement.setAttribute('data-theme', 'night');
      localStorage.setItem('theme', 'night');
    }
  });
});
