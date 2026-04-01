const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieContainer = document.getElementById('movie-container');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

const API_KEY = 'e5d06ce8';

searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies(query);
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
            displayMovies(data.Search);
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

function displayMovies(movies) {
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';

        let poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster+Found';
        
        if (poster.startsWith('http:')) {
            poster = poster.replace('http:', 'https:');
        }

        card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" onerror="this.src='https://via.placeholder.com/300x450?text=Image+Not+Available'">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            </div>
        `;
        movieContainer.appendChild(card);
    });
}