// movies.js
let allCollections = [];
let currentFilter = 'all';
let searchQuery = '';

async function init() {
    try {
        const response = await fetch('movies.json');
        if (!response.ok) throw new Error('Failed to load movies data');
        const data = await response.json();
        const movies = data.data;

        if (movies.hero) renderHero(movies.hero);
        allCollections = movies.collections;
        renderAll();
    } catch (error) {
        console.error('Error initializing movies:', error);
        document.getElementById('collections').innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Error loading movies. Please try again later.</p>`;
    }
}

function renderHero(hero) {
    const heroEl = document.getElementById('hero');
    if (!hero) return;
    
    // Mock some meta data for the hero
    const rating = "8.4";
    const year = "2024";
    const genres = ["Action", "Sci-Fi", "Adventure"].join(' • ');
    
    heroEl.innerHTML = `
        <div class="hero-section" style="background-image: url('${hero.images.backdrop}')">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                ${hero.images.logo ? `<img src="${hero.images.logo}" class="hero-logo-img" alt="${hero.title}">` : `<h1 class="hero-title" style="font-size: 5rem; font-weight: 900; margin-bottom: 1.5rem;">${hero.title}</h1>`}
                <div class="hero-meta">
                    <span class="rating"><i class="fa-solid fa-star"></i> ${rating}</span>
                    <span>${year}</span>
                    <span>${genres}</span>
                </div>
                <p class="hero-description">${hero.description}</p>
                <div class="hero-actions">
                    <button class="btn btn-play" onclick="playMovie('${hero.id}', '${hero.type}', '${hero.title.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-play"></i> Play
                    </button>
                </div>
            </div>
        </div>
    `;
}

function handleSearch(val) {
    searchQuery = val.toLowerCase();
    renderAll();
}

function filterContent(type) {
    currentFilter = type;
    
    // Update active state in UI
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase() === (type === 'all' ? 'home' : type === 'movie' ? 'movies' : 'shows')) {
            link.classList.add('active');
        }
    });
    
    // Fade out effect before re-rendering
    const collectionsEl = document.getElementById('collections');
    collectionsEl.style.opacity = '0';
    collectionsEl.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        renderAll();
        collectionsEl.style.opacity = '1';
        collectionsEl.style.transform = 'translateY(0)';
    }, 300);
}

function renderAll() {
    const collectionsEl = document.getElementById('collections');
    if (!allCollections || allCollections.length === 0) return;

    // Ensure collections container has smooth transition
    collectionsEl.style.transition = 'all 0.6s var(--motion-ease-silky)';

    let html = '';
    
    allCollections.forEach((collection, index) => {
        const filteredItems = collection.items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery);
            const matchesType = currentFilter === 'all' || item.type === currentFilter || (currentFilter === 'series' && item.type === 'tv');
            return matchesSearch && matchesType;
        });

        if (filteredItems.length > 0) {
            html += `
            <div class="collection" id="col-${index}">
                <div class="collection-header">
                    <div class="collection-title-group">
                        <h2 class="collection-title">${collection.title}</h2>
                    </div>
                </div>
                
                <button class="scroll-btn arrow-left" onclick="scrollGrid('grid-${index}', -1)"><i class="fa-solid fa-chevron-left"></i></button>
                <button class="scroll-btn arrow-right" onclick="scrollGrid('grid-${index}', 1)"><i class="fa-solid fa-chevron-right"></i></button>
                
                <div class="movie-grid" id="grid-${index}">
                    ${filteredItems.map((item, i) => {
                        const rating = (Math.random() * (9.5 - 7.0) + 7.0).toFixed(1);
                        const year = "2024";
                        const typeLabel = item.type === 'series' || item.type === 'tv' ? 'TV Show' : 'Movie';
                        
                        return `
                        <div class="movie-card-wrapper" onclick="playMovie('${item.id}', '${item.type}', '${item.title.replace(/'/g, "\\'")}')" style="--delay: ${i * 0.08}s">
                            <div class="movie-card">
                                <img src="${item.poster}" alt="${item.title}" loading="lazy">
                            </div>
                            <div class="movie-meta">
                                <div class="movie-title-row">${item.title}</div>
                                <div class="movie-stats">
                                    <span class="rating"><i class="fa-solid fa-star"></i> ${rating}</span>
                                    <span>${year}</span>
                                    <span>${typeLabel}</span>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
            `;
        }
    });

    if (html === '') {
        html = `<div style="text-align: center; padding: 5rem; color: var(--text-muted);">
            <i class="fa-solid fa-face-frown" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h2>No results found for "${searchQuery}"</h2>
            <p>Try searching for something else or change your filter.</p>
        </div>`;
    }

    collectionsEl.innerHTML = html;
}

function scrollGrid(id, direction) {
    const grid = document.getElementById(id);
    const scrollAmount = grid.clientWidth * 0.8;
    
    grid.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

function playMovie(id, type, title) {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    const titleEl = document.getElementById('modalTitle');
    
    titleEl.textContent = title || 'Playing';
    
    let url = '';
    const isImdb = id.toString().startsWith('tt');
    const param = isImdb ? `imdb=${id}` : `tmdb=${id}`;

    if (type === 'series' || type === 'tv') {
        url = `https://vidsrc-embed.ru/embed/tv?${param}`;
    } else {
        url = `https://vidsrc-embed.ru/embed/movie?${param}`;
    }
    
    player.src = url;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('closeModal').onclick = () => {
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    modal.classList.remove('active');
    player.src = '';
    document.body.style.overflow = 'auto';
};

init();
