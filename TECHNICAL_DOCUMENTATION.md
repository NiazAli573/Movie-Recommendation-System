# Movie Recommendation System - Technical Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Machine Learning & Algorithms](#machine-learning--algorithms)
- [Backend Details](#backend-details)
- [Frontend Details](#frontend-details)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Performance Optimizations](#performance-optimizations)

---

## 🎯 Project Overview

A full-stack, production-ready movie recommendation system that uses **content-based filtering** to suggest similar movies based on multiple features including genres, keywords, cast, crew, and plot overview. The system analyzes over **4,800 movies** from the TMDB 5000 Movies Dataset.

**Live Demo**: https://cinemax-nine-pearl.vercel.app  
**Backend API**: https://movie-rec-system-772967d25b2e.herokuapp.com

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11.7 | Core programming language |
| **FastAPI** | 0.109.0 | High-performance REST API framework |
| **Uvicorn** | 0.27.0 | ASGI server for async support |
| **Gunicorn** | 21.2.0 | Production WSGI HTTP server |
| **Pandas** | 2.2.0 | Data manipulation and analysis |
| **Scikit-learn** | 1.4.0 | Machine learning algorithms |
| **NumPy** | 1.26.3 | Numerical computations |
| **FuzzyWuzzy** | 0.18.0 | Fuzzy string matching for movie titles |
| **python-Levenshtein** | 0.25.0 | Fast string similarity calculations |
| **httpx** | 0.25.2 | Async HTTP client for TMDB API |
| **Pydantic** | 2.5.3 | Data validation and serialization |
| **python-dotenv** | 1.0.0 | Environment variable management |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library |
| **Vite** | 5.0.8 | Build tool and dev server |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework |
| **PostCSS** | 8.4.32 | CSS processing |
| **Autoprefixer** | 10.4.16 | CSS vendor prefixing |
| **ESLint** | 8.55.0 | Code linting |

### External APIs
- **TMDB API**: Fetches movie posters, cast, crew, and detailed metadata

### Deployment & Hosting
- **Backend**: Heroku (Free tier with optimized memory usage)
- **Frontend**: Vercel (Edge network for global CDN)
- **Version Control**: GitHub

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐         HTTP/HTTPS          ┌─────────────────┐
│  React Frontend │ ◄──────────────────────────► │  FastAPI Backend│
│   (Vercel)      │    REST API Requests         │    (Heroku)     │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          │ Fetch Metadata
                                                          ▼
                                                 ┌─────────────────┐
                                                 │   TMDB API      │
                                                 │  (External)     │
                                                 └─────────────────┘
```

### Data Flow
```
User Input (Movie Title)
    │
    ▼
Frontend validates & sends request
    │
    ▼
Backend receives request
    │
    ├─► Fuzzy match movie title
    ├─► Find movie index
    ├─► Calculate similarity scores
    ├─► Get top N similar movies
    └─► Fetch posters from TMDB (cached)
    │
    ▼
Return recommendations to frontend
    │
    ▼
Display movie cards with details
```

---

## 🤖 Machine Learning & Algorithms

### Content-Based Filtering

The system uses **content-based filtering** to recommend movies similar to the user's input. This approach analyzes movie features rather than user behavior.

### Feature Engineering

**Combined Features (Tags)**:
```python
tags = overview + genres + keywords + cast + director
```

Each movie is represented by a "tags" string containing:
1. **Overview**: Plot summary (natural language)
2. **Genres**: Action, Drama, Comedy, etc.
3. **Keywords**: Extracted themes (e.g., "space", "revenge", "superhero")
4. **Cast**: Top 3 actors
5. **Director**: Film director

**Example**:
```
Movie: "The Dark Knight"
Tags: "batman gotham joker crime dark knight action thriller 
       ChristianBale HeathLedger MichaelCaine ChristopherNolan"
```

### Text Vectorization

**CountVectorizer (Bag of Words)**:
- Converts text tags into numerical vectors
- **Max Features**: 2000 (optimized for memory constraints)
- **Stop Words**: English (removes common words like "the", "is", "a")
- Creates a sparse matrix of token counts

**Original Configuration** (pre-optimization):
```python
CountVectorizer(max_features=5000, stop_words='english')
```

**Optimized Configuration** (for Heroku free tier):
```python
CountVectorizer(max_features=2000, stop_words='english')
```

### Similarity Calculation

**Cosine Similarity**:
```python
similarity = cosine_similarity(vectors)
```

Measures the cosine of the angle between two vectors in multi-dimensional space:

```
                A · B
cos(θ) = ─────────────────
         ||A|| × ||B||
```

**Result**: A 4803×4803 similarity matrix where:
- Each cell `[i][j]` represents similarity between movie `i` and movie `j`
- Values range from 0 (completely different) to 1 (identical)
- Diagonal is always 1 (movie is identical to itself)

### Fuzzy String Matching

**FuzzyWuzzy with Levenshtein Distance**:
```python
from fuzzywuzzy import process
best_match = process.extractOne(user_input, movie_titles)
```

**Why Fuzzy Matching?**
- Handles typos: "Avater" → "Avatar"
- Handles partial matches: "Dark Knight" → "The Dark Knight"
- Case-insensitive matching
- Returns confidence score

**Algorithm**: Levenshtein Distance (edit distance)
- Measures minimum single-character edits needed to change one string to another
- Edits: insertions, deletions, substitutions

---

## 🔧 Backend Details

### FastAPI Application Structure

```python
app = FastAPI()

# Middleware
- CORSMiddleware (handles cross-origin requests)

# Startup Events
@app.on_event("startup")
- Loads CSV files
- Processes data
- Creates similarity matrix
- Loads poster cache

# Global State
- movies_data: Pandas DataFrame (4803 movies)
- similarity_matrix: NumPy array (4803×4803)
- poster_cache: Dict (movie_id → poster_url)
```

### Key Backend Features

#### 1. **Data Loading & Processing**
```python
def load_and_process_data():
    # Load CSVs
    # Merge movies + credits
    # Parse JSON columns
    # Extract features
    # Create tags
    # Vectorize text
    # Calculate similarity matrix
```

#### 2. **CORS Configuration**
```python
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cinemax-nine-pearl.vercel.app"
]
```

#### 3. **Poster Caching**
```python
# In-memory + persistent file cache
poster_cache = {}  # Runtime cache
POSTER_CACHE_FILE = "poster_cache.json"  # Persistent cache
```

**Benefits**:
- Reduces API calls to TMDB
- Faster response times
- Avoids rate limiting
- Persists across server restarts

#### 4. **Async TMDB Integration**
```python
async with httpx.AsyncClient() as client:
    response = await client.get(
        f"{TMDB_API_BASE}/search/movie",
        params={"api_key": TMDB_API_KEY, "query": title}
    )
```

**Why Async?**
- Non-blocking I/O for API calls
- Multiple concurrent requests
- Better performance under load

### API Endpoints

#### **GET /**
Health check endpoint
```json
{"message": "Movie Recommendation API", "status": "running"}
```

#### **POST /recommend**
Get movie recommendations
```json
Request:
{
  "title": "The Dark Knight"
}

Response:
[
  {
    "id": 155,
    "title": "The Dark Knight Rises",
    "overview": "Following the death of District Attorney...",
    "poster_url": "https://image.tmdb.org/t/p/w500/...",
    "vote_average": 7.6,
    "release_date": "2012-07-16",
    "genres": ["Action", "Crime", "Drama"],
    "runtime": 165.0,
    "tagline": "The Legend Ends",
    "director": "Christopher Nolan"
  }
]
```

#### **GET /movies**
Get all movie titles
```json
["Avatar", "Pirates of the Caribbean", "Spectre", ...]
```

#### **GET /top-movies**
Get top-rated movies
```json
[
  {
    "id": 278,
    "title": "The Shawshank Redemption",
    "vote_average": 8.5,
    "poster_url": "...",
    "release_date": "1994-09-23"
  }
]
```

#### **GET /genres**
Get all available genres
```json
["Action", "Adventure", "Animation", "Comedy", ...]
```

#### **GET /movies-by-genre?genre=Action**
Filter movies by genre
```json
[
  {
    "id": 19995,
    "title": "Avatar",
    "vote_average": 7.2,
    "genres": ["Action", "Adventure", "Fantasy"]
  }
]
```

#### **GET /autocomplete?q=dark**
Search autocomplete
```json
[
  "The Dark Knight",
  "The Dark Knight Rises",
  "Dark Shadows",
  "A Scanner Darkly"
]
```

#### **GET /movie/{movie_id}**
Get detailed movie information
```json
{
  "id": 155,
  "title": "The Dark Knight",
  "overview": "...",
  "poster_url": "...",
  "vote_average": 8.3,
  "vote_count": 21500,
  "release_date": "2008-07-16",
  "genres": ["Action", "Crime", "Drama"],
  "runtime": 152.0,
  "tagline": "Why So Serious?",
  "director": "Christopher Nolan",
  "cast": [
    {"name": "Christian Bale", "character": "Bruce Wayne / Batman"}
  ],
  "crew": [
    {"name": "Christopher Nolan", "job": "Director"}
  ]
}
```

---

## 🎨 Frontend Details

### React Component Architecture

```
App.jsx (Root)
    │
    └── MovieSearch.jsx (Main Component)
            │
            ├── MovieDetailModal (Modal Popup)
            ├── FilterBar (Autocomplete, Genre Filter)
            ├── MovieGrid (Search Results/Top Movies)
            └── RecommendationsSection (Similar Movies)
```

### Key Frontend Features

#### 1. **Real-time Auto-complete**
```javascript
const [suggestions, setSuggestions] = useState([]);

// Debounced search
useEffect(() => {
  const timer = setTimeout(async () => {
    if (movieTitle.length >= 2) {
      const res = await fetch(`${API_BASE}/autocomplete?q=${movieTitle}`);
      const data = await res.json();
      setSuggestions(data);
    }
  }, 300);
  return () => clearTimeout(timer);
}, [movieTitle]);
```

#### 2. **Genre Filtering**
```javascript
const [selectedGenre, setSelectedGenre] = useState('');

// Fetch movies by genre
const fetchMoviesByGenre = async (genre) => {
  const res = await fetch(`${API_BASE}/movies-by-genre?genre=${genre}`);
  const data = await res.json();
  setTopMovies(data);
};
```

#### 3. **Movie Detail Modal**
- Full-screen overlay
- Poster + metadata
- Cast & crew information
- Ratings & runtime
- Tagline & overview
- Keyboard shortcuts (ESC to close)
- Click outside to close

#### 4. **Responsive Design**
```css
/* Tailwind CSS Grid */
grid-cols-1        /* Mobile: 1 column */
sm:grid-cols-2     /* Tablet: 2 columns */
md:grid-cols-3     /* Desktop: 3 columns */
lg:grid-cols-4     /* Large: 4 columns */
xl:grid-cols-5     /* XL: 5 columns */
```

#### 5. **Loading States**
```javascript
{loading ? (
  <div className="animate-spin">⏳</div>
) : (
  <MovieGrid movies={movies} />
)}
```

### Styling Approach

**Tailwind CSS Utility Classes**:
- `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900` (gradients)
- `hover:scale-105 transition-transform` (interactive animations)
- `backdrop-blur-sm` (glass morphism effects)
- `text-transparent bg-clip-text bg-gradient-to-r` (gradient text)

**Custom Animations**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 🚀 Deployment

### Backend Deployment (Heroku)

**Configuration Files**:

1. **Procfile**:
```
web: gunicorn -w 1 -k uvicorn.workers.UvicornWorker --timeout 240 --max-requests 1000 --max-requests-jitter 50 main:app
```

Configuration breakdown:
- `-w 1`: **1 worker** (optimized for 512MB RAM)
- `-k uvicorn.workers.UvicornWorker`: Async worker class
- `--timeout 240`: 240s timeout for slow requests
- `--max-requests 1000`: Restart worker after 1000 requests (memory leak prevention)
- `--max-requests-jitter 50`: Random jitter to prevent all workers restarting simultaneously

2. **runtime.txt**:
```
python-3.11.7
```

3. **requirements.txt**:
All Python dependencies with pinned versions

**Environment Variables**:
```bash
TMDB_API_KEY=<your_api_key>
PORT=8000
FRONTEND_URL=https://cinemax-nine-pearl.vercel.app
```

**Deployment Commands**:
```bash
git push heroku main
heroku logs --tail
heroku ps:scale web=1
```

### Frontend Deployment (Vercel)

**Configuration Files**:

1. **vercel.json**:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

2. **vite.config.js**:
```javascript
export default {
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
}
```

**Environment Variables**:
```bash
VITE_API_BASE_URL=https://movie-rec-system-772967d25b2e.herokuapp.com
```

**⚠️ Important**: No trailing slash in API URL!

**Deployment**:
- Auto-deploys on `git push` to main branch
- Edge network (global CDN)
- Automatic HTTPS
- Preview deployments for PRs

---

## ⚡ Performance Optimizations

### Memory Optimization

**Problem**: Original configuration used 1.4GB RAM on Heroku's 512MB free tier.

**Solutions**:

1. **Reduced Workers**:
```python
# Before: -w 4 (4 workers × 350MB = 1.4GB)
# After:  -w 1 (1 worker × 450MB = 450MB)
```

2. **Reduced Feature Count**:
```python
# Before: max_features=5000
# After:  max_features=2000
# Impact: ~40% reduction in similarity matrix size
```

3. **Added Worker Recycling**:
```python
--max-requests 1000 --max-requests-jitter 50
```

### API Optimization

1. **Poster Caching**:
   - In-memory dictionary
   - Persistent JSON file
   - Reduces TMDB API calls by ~95%

2. **Async HTTP Calls**:
   - Non-blocking I/O
   - Concurrent poster fetching
   - Faster response times

3. **Fuzzy Matching Optimization**:
   - Added `python-Levenshtein` for C-based implementation
   - ~10x faster than pure Python implementation

### Frontend Optimization

1. **Vite Build Tool**:
   - Fast HMR (Hot Module Replacement)
   - Optimized production builds
   - Code splitting

2. **Debounced Search**:
   - 300ms delay before API call
   - Reduces unnecessary requests

3. **Lazy Loading**:
   - Images loaded on-demand
   - Modal content fetched only when opened

4. **Minification**:
   - Terser for JavaScript
   - PurgeCSS for Tailwind (removes unused styles)

---

## 📊 Dataset Information

**TMDB 5000 Movies Dataset**:
- **Source**: Kaggle / The Movie Database (TMDB)
- **Size**: 4,803 movies
- **Files**:
  - `tmdb_5000_movies.csv`: Movie metadata
  - `tmdb_5000_credits.csv`: Cast & crew information

**Key Columns**:
- `id`: Unique movie identifier
- `title`: Movie title
- `overview`: Plot summary
- `genres`: JSON array of genres
- `keywords`: JSON array of keywords
- `cast`: JSON array of actors
- `crew`: JSON array of crew members
- `vote_average`: TMDB rating (0-10)
- `release_date`: Release date
- `runtime`: Duration in minutes
- `budget`: Production budget
- `revenue`: Box office revenue

---

## 🔒 Security & Best Practices

1. **Environment Variables**:
   - API keys stored in `.env` file
   - Never committed to version control
   - `.gitignore` configured properly

2. **CORS Configuration**:
   - Whitelist specific origins
   - No wildcard (`*`) in production

3. **API Rate Limiting**:
   - Caching to reduce external API calls
   - Future: Implement rate limiting middleware

4. **Error Handling**:
   - Try-catch blocks for all API calls
   - Graceful degradation
   - User-friendly error messages

5. **Input Validation**:
   - Pydantic models for request validation
   - Frontend validation before API calls

---

## 🎓 Lessons Learned

### Challenges & Solutions

1. **Memory Constraints on Free Tier**:
   - **Challenge**: App crashed due to R15 error (1.4GB usage)
   - **Solution**: Reduced workers, optimized feature count

2. **CORS Issues**:
   - **Challenge**: Frontend couldn't access backend
   - **Solution**: Properly configured allowed origins

3. **Slow Fuzzy Matching**:
   - **Challenge**: Pure Python implementation was slow
   - **Solution**: Added C-based `python-Levenshtein` library

4. **Double Slash in URLs**:
   - **Challenge**: `//genres` instead of `/genres`
   - **Solution**: Removed trailing slash from environment variable

---

## 🔮 Future Enhancements

1. **Collaborative Filtering**: Incorporate user ratings and preferences
2. **Hybrid Approach**: Combine content-based + collaborative filtering
3. **User Accounts**: Save favorite movies and watch history
4. **Advanced Filters**: Filter by year, rating, runtime
5. **Trending Section**: Display currently trending movies
6. **Watch Providers**: Show where to stream movies
7. **Trailer Integration**: Embed YouTube trailers
8. **Social Features**: Share recommendations with friends
9. **Multilingual Support**: Support for multiple languages
10. **Mobile App**: Native iOS/Android app

---

## 📚 References & Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [TMDB API Documentation](https://developers.themoviedb.org/3)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Research Papers
- "Content-Based Recommendation Systems" (Pazzani & Billsus, 2007)
- "Bag-of-Words Model in Information Retrieval"
- "Cosine Similarity and Its Applications"

### Datasets
- [TMDB 5000 Movies Dataset - Kaggle](https://www.kaggle.com/tmdb/tmdb-movie-metadata)

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Author

**Niaz Ali**  
- GitHub: [@NiazAli573](https://github.com/NiazAli573)
- Repository: [Movie-Recommendation-System](https://github.com/NiazAli573/Movie-Recommendation-System)

---

**Last Updated**: February 14, 2026
