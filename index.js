const CACHE_KEY_REPOS = 'github_repos';
const CACHE_KEY_EVENTS = 'github_events';
const CACHE_EXPIRY = 5 * 60 * 1000;

let currentView = 'home';
let currentPostSlug = null;

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

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return frontmatter;
}

function switchView(view) {
  const homeView = document.getElementById('homeView');
  const blogView = document.getElementById('blogView');
  const zennView = document.getElementById('zennView');
  const navLinks = document.querySelectorAll('[data-view]');
  
  currentView = view;
  
  if (view === 'home') {
    if (homeView) homeView.style.display = 'block';
    if (blogView) blogView.style.display = 'none';
    if (zennView) zennView.style.display = 'none';
    currentPostSlug = null;
    window.scrollTo(0, 0);
  } else if (view === 'blog') {
    if (homeView) homeView.style.display = 'none';
    if (blogView) blogView.style.display = 'block';
    if (zennView) zennView.style.display = 'none';
    loadBlogList();
    window.scrollTo(0, 0);
  } else if (view === 'zenn') {
    if (homeView) homeView.style.display = 'none';
    if (blogView) blogView.style.display = 'none';
    if (zennView) zennView.style.display = 'block';
    loadZennArticles();
    window.scrollTo(0, 0);
  }
  
  navLinks.forEach(link => {
    if (link.dataset.view === view) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
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

async function loadContributionStats() {
  const totalEl = document.getElementById('totalContributions');
  const todayEl = document.getElementById('todayContributions');
  if (!totalEl || !todayEl) return;

  try {
    let events;
    const cachedEvents = getCachedData(CACHE_KEY_EVENTS);
    if (cachedEvents) {
      events = cachedEvents;
    } else {
      const response = await fetch('https://api.github.com/users/nazozokc/events?per_page=100');
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error('rate_limit');
        }
        throw new Error('network');
      }
      events = await response.json();
      setCachedData(CACHE_KEY_EVENTS, events);
    }

    const now = new Date();
    const today = now.toDateString();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    let totalCount = 0;
    let todayCount = 0;

    for (const event of events) {
      if (event.type !== 'PushEvent') continue;
      const eventDate = new Date(event.created_at);
      if (eventDate < ninetyDaysAgo) continue;

      totalCount += event.payload.commits?.length || 0;
      if (eventDate.toDateString() === today) {
        todayCount += event.payload.commits?.length || 0;
      }
    }

    totalEl.textContent = totalCount;
    todayEl.textContent = todayCount;

  } catch (err) {
    totalEl.textContent = '-';
    todayEl.textContent = '-';
  }
}

async function loadBlogList() {
  const container = document.getElementById('blogContainer');
  if (!container) return;

  try {
    const manifestResponse = await fetch('blog-manifest.json');
    if (!manifestResponse.ok) {
      throw new Error('Failed to load blog manifest');
    }
    const slugs = await manifestResponse.json();

    const postFiles = await Promise.all(
      slugs.map(slug => fetch(`blog/${slug}.md`)
        .then(r => r.ok ? r.text() : Promise.resolve(null))
        .catch(() => null))
    );

    const posts = [];
    for (let i = 0; i < slugs.length; i++) {
      const markdown = postFiles[i];
      if (!markdown) continue;
      const frontmatter = parseFrontmatter(markdown);
      if (frontmatter) {
        posts.push({
          slug: slugs[i],
          title: frontmatter.title || slugs[i],
          emoji: frontmatter.emoji || '',
          date: frontmatter.date || '',
          category: frontmatter.category || ''
        });
      }
    }

    if (posts.length === 0) {
      container.innerHTML = '<p class="loading">No blog posts found</p>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <a href="#" class="blog-card" data-post="${post.slug}">
        <div class="blog-header">
          <span class="blog-emoji">${escapeHtml(post.emoji)}</span>
          <span class="blog-date">${escapeHtml(post.date)}</span>
        </div>
        <h3 class="blog-title">${escapeHtml(post.title)}</h3>
        <span class="blog-category">${escapeHtml(post.category)}</span>
      </a>
    `).join('');

    container.querySelectorAll('[data-post]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        loadBlogPost(card.dataset.post);
      });
    });

  } catch (err) {
    container.innerHTML = '<p class="error-msg">Failed to load blog posts</p>';
  }
}

async function loadZennArticles() {
  const container = document.getElementById('zennContainer');
  if (!container) return;

  try {
    const response = await fetch('https://zenn.dev/api/articles?username=nazozokc&order=latest');
    if (!response.ok) {
      throw new Error('Failed to fetch Zenn articles');
    }
    const data = await response.json();
    const articles = data.articles || [];

    if (articles.length === 0) {
      container.innerHTML = '<p class="loading">No articles found</p>';
      return;
    }

    container.innerHTML = articles.map(article => `
      <a href="https://zenn.dev/nazozokc/articles/${article.slug}" target="_blank" rel="noopener noreferrer" class="blog-card">
        <div class="blog-header">
          <span class="blog-emoji">📝</span>
          <span class="blog-date">${new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
        </div>
        <h3 class="blog-title">${escapeHtml(article.title)}</h3>
        <span class="blog-category">${escapeHtml(article.tags?.[0] || '')}</span>
      </a>
    `).join('');

  } catch (err) {
    console.error('Zenn load error:', err);
    container.innerHTML = '<p class="error-msg">Failed to load Zenn articles</p>';
  }
}

function showBlogList() {
  const postContainer = document.getElementById('postContainer');
  const blogHero = document.getElementById('blogHero');
  const blogSection = document.getElementById('blogSection');
  
  currentPostSlug = null;
  if (postContainer) postContainer.style.display = 'none';
  if (blogHero) blogHero.style.display = 'block';
  if (blogSection) blogSection.style.display = 'block';
}

async function loadBlogPost(slug) {
  const postContainer = document.getElementById('postContainer');
  const blogHero = document.getElementById('blogHero');
  const blogSection = document.getElementById('blogSection');

  if (!postContainer) return;

  currentPostSlug = slug;
  postContainer.innerHTML = '<p class="loading">Loading...</p>';
  postContainer.style.display = 'block';
  if (blogHero) blogHero.style.display = 'none';
  if (blogSection) blogSection.style.display = 'none';

  try {
    const response = await fetch(`blog/${slug}.md`);
    if (!response.ok) {
      throw new Error('Failed to load post');
    }
    const markdown = await response.text();

    const frontmatter = parseFrontmatter(markdown);
    const html = marked.parse(markdown.replace(/^---[\s\S]*?---\n/, ''));
    
    postContainer.innerHTML = `
      <div class="post-card">
        <a href="#" class="back-link" id="backToList">← 一覧に戻る</a>
        <article class="post-content">
          <header class="post-header">
            <div class="post-meta">
              <span class="post-emoji">${escapeHtml(frontmatter?.emoji || '')}</span>
              <span class="post-date">${escapeHtml(frontmatter?.date || '')}</span>
              <span class="post-category">${escapeHtml(frontmatter?.category || '')}</span>
            </div>
            <h1 class="post-title">${escapeHtml(frontmatter?.title || slug)}</h1>
          </header>
          <div class="markdown-body">${html}</div>
        </article>
      </div>
    `;
    
    document.getElementById('backToList').addEventListener('click', (e) => {
      e.preventDefault();
      showBlogList();
    });
  } catch (err) {
    postContainer.innerHTML = `
      <div class="post-card">
        <a href="#" class="back-link" id="backToList">← 一覧に戻る</a>
        <p class="error-msg">Failed to load blog post</p>
      </div>
    `;
    document.getElementById('backToList').addEventListener('click', (e) => {
      e.preventDefault();
      showBlogList();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    loadRepositories(),
    loadContributionStats()
  ]);

  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

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
