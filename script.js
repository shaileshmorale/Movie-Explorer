const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieContainer = document.getElementById('movie-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const themeToggle = document.getElementById('theme-toggle');
const yearFilter = document.getElementById('year-filter');
const sortSelect = document.getElementById('sort-select');
const movieModal = document.getElementById('movie-modal');
const movieDetails = document.getElementById('movie-details');
const closeModal = document.querySelector('.close');

const API_KEY = 'e5d06ce8';
let currentMovies = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

// Load theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.textContent = '☀️';
}

// Search form submit
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies(query);
    }
});

// Filter and sort change
yearFilter.addEventListener('input', applyFiltersAndSort);
sortSelect.addEventListener('change', applyFiltersAndSort);

// Modal close
closeModal.addEventListener('click', () => {
    movieModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === movieModal) {
        movieModal.classList.add('hidden');
    }
});

async function fetchMovies(query) {
    movieContainer.innerHTML = '';
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
        const data = await response.json();

        loading.classList.add('hidden');

        if (data.Response === 'True') {
            currentMovies = data.Search;
            applyFiltersAndSort();
        } else {
            errorMessage.textContent = data.Error || 'No movies found.';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        loading.classList.add('hidden');
        errorMessage.textContent = 'Failed to fetch data. Please try again.';
        errorMessage.classList.remove('hidden');
    }
}

function applyFiltersAndSort() {
    let filteredMovies = currentMovies;

    // Filter by year
    const yearFrom = parseInt(yearFilter.value);
    if (!isNaN(yearFrom)) {
        filteredMovies = filteredMovies.filter(movie => parseInt(movie.Year) >= yearFrom);
    }

    // Sort
    const sortValue = sortSelect.value;
    if (sortValue === 'title-asc') {
        filteredMovies = filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
    } else if (sortValue === 'title-desc') {
        filteredMovies = filteredMovies.sort((a, b) => b.Title.localeCompare(a.Title));
    } else if (sortValue === 'year-asc') {
        filteredMovies = filteredMovies.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
    } else if (sortValue === 'year-desc') {
        filteredMovies = filteredMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    }

    displayMovies(filteredMovies);
}

function displayMovies(movies) {
    movieContainer.innerHTML = '';
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        let poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster+Found';
        
        if (poster.startsWith('http:')) {
            poster = poster.replace('http:', 'https:');
        }

        const isFavorited = favorites.some(fav => fav.imdbID === movie.imdbID);

        card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" onerror="this.src='https://via.placeholder.com/300x450?text=Image+Not+Available'">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <div class="card-buttons">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${movie.imdbID}">
                        ${isFavorited ? '★' : '☆'}
                    </button>
                    <button class="view-more-btn" data-id="${movie.imdbID}">View More</button>
                </div>
            </div>
        `;
        movieContainer.appendChild(card);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });

    document.querySelectorAll('.view-more-btn').forEach(btn => {
        btn.addEventListener('click', viewMovieDetails);
    });
}

function toggleFavorite(e) {
    const movieId = e.target.dataset.id;
    const movie = currentMovies.find(m => m.imdbID === movieId);

    const index = favorites.findIndex(fav => fav.imdbID === movieId);
    if (index > -1) {
        favorites.splice(index, 1);
        e.target.textContent = '☆';
        e.target.classList.remove('favorited');
    } else {
        favorites.push(movie);
        e.target.textContent = '★';
        e.target.classList.add('favorited');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function viewMovieDetails(e) {
    const movieId = e.target.dataset.id;

    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${API_KEY}`);
        const movie = await response.json();

        if (movie.Response === 'True') {
            let poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster+Found';
            if (poster.startsWith('http:')) {
                poster = poster.replace('http:', 'https:');
            }

            movieDetails.innerHTML = `
                <img src="${poster}" alt="${movie.Title}">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
            `;

            movieModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
    }
}