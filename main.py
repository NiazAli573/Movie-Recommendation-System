import pandas as pd
import ast
import os
import re
import json
import asyncio
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from fuzzywuzzy import fuzz, process
from dotenv import load_dotenv

load_dotenv()

# TMDB Configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
TMDB_API_BASE = "https://api.themoviedb.org/3"

app = FastAPI()

# Configure CORS - Allow both local development and production domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "").strip(),  # For Vercel deployment
]
# Remove empty strings from origins
allowed_origins = [origin for origin in allowed_origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store processed data
movies_data = None
similarity_matrix = None
poster_cache = {}  # Cache poster URLs to avoid repeated API calls
POSTER_CACHE_FILE = "poster_cache.json"

def load_poster_cache():
    """Load poster cache from JSON file for persistence across restarts"""
    global poster_cache
    try:
        if os.path.exists(POSTER_CACHE_FILE):
            with open(POSTER_CACHE_FILE, 'r') as f:
                poster_cache = {int(k): v for k, v in json.load(f).items()}
    except Exception:
        poster_cache = {}

def save_poster_cache():
    """Save poster cache to JSON file"""
    try:
        with open(POSTER_CACHE_FILE, 'w') as f:
            json.dump({str(k): v for k, v in poster_cache.items()}, f)
    except Exception:
        pass

class MovieRequest(BaseModel):
    title: str

class MovieResponse(BaseModel):
    id: int
    title: str
    overview: str
    poster_url: str = ""
    vote_average: float = 0.0
    release_date: str = ""
    genres: list[str] = []
    runtime: float = 0.0
    tagline: str = ""
    director: str = ""

class CastMember(BaseModel):
    name: str
    character: str = ""

class CrewMember(BaseModel):
    name: str
    job: str

class MovieDetailResponse(BaseModel):
    id: int
    title: str
    overview: str
    poster_url: str = ""
    vote_average: float = 0.0
    vote_count: int = 0
    release_date: str = ""
    genres: list[str] = []
    runtime: float = 0.0
    tagline: str = ""
    director: str = ""
    cast: list[CastMember] = []
    crew: list[CrewMember] = []
    budget: int = 0
    revenue: int = 0
    spoken_languages: list[str] = []
    production_companies: list[str] = []
    status: str = ""

def load_and_process_data():
    """Load and process movie data"""
    global movies_data, similarity_matrix
    
    # Load datasets
    movies = pd.read_csv('tmdb_5000_movies.csv')
    credits = pd.read_csv('tmdb_5000_credits.csv')
    
    # Merge datasets (drop duplicate title column from credits)
    credits = credits.drop('title', axis=1)
    movies = movies.merge(credits, left_on='id', right_on='movie_id', how='left')
    
    # Select relevant columns
    movies = movies[['id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
    
    # Handle null values
    movies['overview'] = movies['overview'].fillna('')
    movies['genres'] = movies['genres'].fillna('[]')
    movies['keywords'] = movies['keywords'].fillna('[]')
    movies['cast'] = movies['cast'].fillna('[]')
    movies['crew'] = movies['crew'].fillna('[]')
    
    # Convert JSON-like strings to lists
    def parse_json_column(x):
        try:
            data = ast.literal_eval(x)
            if isinstance(data, list):
                return [item['name'] for item in data if 'name' in item]
            return []
        except:
            return []
    
    movies['genres'] = movies['genres'].apply(parse_json_column)
    movies['keywords'] = movies['keywords'].apply(parse_json_column)
    
    # Extract top 3 cast members
    def get_cast(x):
        try:
            data = ast.literal_eval(x)
            if isinstance(data, list):
                return [item['name'] for item in data[:3] if 'name' in item]
            return []
        except:
            return []
    
    # Save raw JSON strings for detail endpoint before processing
    movies['cast_raw'] = movies['cast']
    movies['crew_raw'] = movies['crew']
    
    movies['cast'] = movies['cast'].apply(get_cast)
    
    # Extract director
    def get_director(x):
        try:
            data = ast.literal_eval(x)
            if isinstance(data, list):
                for item in data:
                    if item.get('job') == 'Director':
                        return [item['name']]
            return []
        except:
            return []
    
    movies['director'] = movies['crew'].apply(get_director)
    
    # Save original director name before processing
    movies['director_name'] = movies['director'].apply(lambda x: x[0] if len(x) > 0 else '')
    
    # Remove spaces from names for better matching
    def remove_spaces(lst):
        return [item.replace(" ", "") for item in lst]
    
    movies['genres'] = movies['genres'].apply(remove_spaces)
    movies['keywords'] = movies['keywords'].apply(remove_spaces)
    movies['cast'] = movies['cast'].apply(remove_spaces)
    movies['director'] = movies['director'].apply(remove_spaces)
    
    # Create tags column
    movies['tags'] = (
        movies['overview'] + ' ' +
        movies['genres'].apply(lambda x: ' '.join(x)) + ' ' +
        movies['keywords'].apply(lambda x: ' '.join(x)) + ' ' +
        movies['cast'].apply(lambda x: ' '.join(x)) + ' ' +
        movies['director'].apply(lambda x: ' '.join(x))
    )
    
    # Convert to lowercase
    movies['tags'] = movies['tags'].apply(lambda x: x.lower())
    
    # Keep only required columns (include raw cast/crew for detail endpoint)
    movies_data = movies[['id', 'title', 'overview', 'tags', 'director_name', 'cast_raw', 'crew_raw']].copy()
    
    # Restore original genres/vote/date from the raw movies dataframe (before processing)
    raw_movies = pd.read_csv('tmdb_5000_movies.csv')
    movies_data = movies_data.merge(
        raw_movies[['id', 'vote_average', 'release_date', 'genres', 'runtime', 'tagline']],
        on='id', how='left'
    )
    movies_data['vote_average'] = movies_data['vote_average'].fillna(0.0)
    movies_data['release_date'] = movies_data['release_date'].fillna('')
    movies_data['runtime'] = movies_data['runtime'].fillna(0.0)
    movies_data['tagline'] = movies_data['tagline'].fillna('')
    
    # Parse genres into readable list
    def parse_genres_readable(x):
        try:
            data = ast.literal_eval(x)
            if isinstance(data, list):
                return [item['name'] for item in data if 'name' in item]
            return []
        except:
            return []
    
    movies_data['genres_list'] = movies_data['genres'].apply(parse_genres_readable)
    movies_data = movies_data.drop('genres', axis=1)
    
    # Create similarity matrix
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(movies_data['tags']).toarray()
    similarity_matrix = cosine_similarity(vectors)
    
    return movies_data, similarity_matrix

@app.on_event("startup")
async def startup_event():
    """Load data when the app starts"""
    global movies_data, similarity_matrix
    print("Loading and processing movie data...")
    movies_data, similarity_matrix = load_and_process_data()
    load_poster_cache()
    print(f"Loaded {len(movies_data)} movies successfully!")
    if poster_cache:
        print(f"Loaded {len(poster_cache)} cached poster URLs.")
    if not TMDB_API_KEY or TMDB_API_KEY == "your_tmdb_api_key_here":
        print("INFO: No TMDB API key — posters will be fetched from TMDB web pages.")

async def fetch_poster_url(movie_id: int) -> str:
    """Fetch movie poster URL from TMDB API or by scraping TMDB web page"""
    if movie_id in poster_cache and poster_cache[movie_id]:
        return poster_cache[movie_id]

    poster_url = ""

    # Method 1: TMDB API (if key is available)
    if TMDB_API_KEY and TMDB_API_KEY != "your_tmdb_api_key_here":
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{TMDB_API_BASE}/movie/{movie_id}",
                    params={"api_key": TMDB_API_KEY},
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    poster_path = data.get("poster_path", "")
                    if poster_path:
                        poster_url = f"{TMDB_IMAGE_BASE}{poster_path}"
        except Exception as e:
            print(f"API fetch failed for movie {movie_id}: {e}")

    # Method 2: Scrape TMDB movie page (no API key needed)
    if not poster_url:
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(
                    f"https://www.themoviedb.org/movie/{movie_id}",
                    timeout=10.0,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml",
                    }
                )
                if response.status_code == 200:
                    # Extract poster image path from the TMDB page HTML
                    match = re.search(
                        r'https://media\.themoviedb\.org/t/p/w\d+(?:_and_h\d+_face)?(/[^"\'>\s]+\.(?:jpg|png))',
                        response.text
                    )
                    if match:
                        poster_path = match.group(1)
                        poster_url = f"{TMDB_IMAGE_BASE}{poster_path}"
        except Exception as e:
            print(f"Web scrape failed for movie {movie_id}: {e}")

    if poster_url:
        poster_cache[movie_id] = poster_url
        save_poster_cache()
    return poster_url

@app.get("/")
async def root():
    return {"message": "Movie Recommendation API", "movies_count": len(movies_data) if movies_data is not None else 0}

@app.post("/recommend", response_model=list[MovieResponse])
async def recommend_movies(request: MovieRequest):
    """Recommend movies based on the input movie title"""
    global movies_data, similarity_matrix
    
    if movies_data is None or similarity_matrix is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
    
    # Find the movie
    movie_title = request.title.strip()
    
    # Create a normalized version for better matching (remove spaces, hyphens, etc.)
    def normalize_title(title):
        return title.lower().replace(" ", "").replace("-", "").replace(":", "").replace("'", "")
    
    normalized_input = normalize_title(movie_title)
    
    # Case-insensitive exact match
    movie_matches = movies_data[movies_data['title'].str.lower() == movie_title.lower()]
    
    if movie_matches.empty:
        # Try normalized match (e.g., "SpiderMan" matches "Spider-Man")
        movies_data['normalized'] = movies_data['title'].apply(normalize_title)
        movie_matches = movies_data[movies_data['normalized'] == normalized_input]
        
        if movie_matches.empty:
            # Try fuzzy matching with high threshold
            all_titles = movies_data['title'].tolist()
            best_match = process.extractOne(movie_title, all_titles, scorer=fuzz.token_sort_ratio)
            
            if best_match and best_match[1] >= 70:  # 70% similarity threshold
                movie_matches = movies_data[movies_data['title'] == best_match[0]]
            else:
                # Last resort: partial match
                movie_matches = movies_data[movies_data['title'].str.lower().str.contains(movie_title.lower(), na=False)]
                
                if movie_matches.empty:
                    raise HTTPException(status_code=404, detail=f"Movie '{movie_title}' not found. Try searching from the suggestions.")
    
    # Get the first match
    movie_idx = movie_matches.index[0]
    
    # Get similarity scores
    distances = similarity_matrix[movie_idx]
    
    # Get top 6 similar movies (including the movie itself)
    movie_indices = np.argsort(distances)[::-1][1:6]  # Skip the first one (itself)
    
    # Fetch all poster URLs in parallel for faster loading
    movie_indices_list = list(movie_indices)
    poster_tasks = [fetch_poster_url(int(movies_data.iloc[idx]['id'])) for idx in movie_indices_list]
    poster_urls = await asyncio.gather(*poster_tasks)

    # Prepare response
    recommendations = []
    for i, idx in enumerate(movie_indices_list):
        movie = movies_data.iloc[idx]
        recommendations.append(MovieResponse(
            id=int(movie['id']),
            title=movie['title'],
            overview=movie['overview'] if pd.notna(movie['overview']) else 'No overview available',
            poster_url=poster_urls[i],
            vote_average=float(movie['vote_average']),
            release_date=str(movie['release_date']),
            genres=movie['genres_list'] if isinstance(movie['genres_list'], list) else [],
            runtime=float(movie['runtime']) if pd.notna(movie['runtime']) else 0.0,
            tagline=str(movie['tagline']) if pd.notna(movie['tagline']) else '',
            director=str(movie['director_name']) if pd.notna(movie.get('director_name')) else ''
        ))

    return recommendations

@app.get("/top-movies", response_model=list[MovieResponse])
async def get_top_movies():
    """Get top 20 highest rated movies (min 1000 votes for quality filter)"""
    global movies_data

    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")

    # Read vote_count from raw CSV to filter out low-vote movies
    raw = pd.read_csv('tmdb_5000_movies.csv')[['id', 'vote_count']]
    merged = movies_data.merge(raw, on='id', how='left')
    qualified = merged[merged['vote_count'] >= 1000].nlargest(20, 'vote_average')

    # Fetch posters in parallel
    ids = [int(row['id']) for _, row in qualified.iterrows()]
    poster_urls = await asyncio.gather(*[fetch_poster_url(mid) for mid in ids])

    results = []
    for i, (_, movie) in enumerate(qualified.iterrows()):
        results.append(MovieResponse(
            id=int(movie['id']),
            title=movie['title'],
            overview=movie['overview'] if pd.notna(movie['overview']) else '',
            poster_url=poster_urls[i],
            vote_average=float(movie['vote_average']),
            release_date=str(movie['release_date']),
            genres=movie['genres_list'] if isinstance(movie['genres_list'], list) else [],
            runtime=float(movie['runtime']) if pd.notna(movie['runtime']) else 0.0,
            tagline=str(movie['tagline']) if pd.notna(movie['tagline']) else '',
            director=str(movie['director_name']) if pd.notna(movie.get('director_name')) else ''
        ))
    return results

@app.get("/movie/{movie_id}", response_model=MovieDetailResponse)
async def get_movie_detail(movie_id: int):
    """Get full details for a single movie including cast & crew"""
    global movies_data

    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")

    movie_row = movies_data[movies_data['id'] == movie_id]
    if movie_row.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    movie = movie_row.iloc[0]

    # Parse cast — top 10 with character names
    cast_list = []
    try:
        raw_cast = ast.literal_eval(movie['cast_raw']) if isinstance(movie['cast_raw'], str) else []
        for c in raw_cast[:10]:
            cast_list.append(CastMember(
                name=c.get('name', ''),
                character=c.get('character', '')
            ))
    except Exception:
        pass

    # Parse crew — director, writers, producers, cinematographer, composer
    crew_list = []
    KEY_JOBS = {'Director', 'Writer', 'Screenplay', 'Producer', 'Executive Producer',
                'Director of Photography', 'Original Music Composer', 'Editor'}
    try:
        raw_crew = ast.literal_eval(movie['crew_raw']) if isinstance(movie['crew_raw'], str) else []
        seen = set()
        for c in raw_crew:
            job = c.get('job', '')
            name = c.get('name', '')
            if job in KEY_JOBS and (name, job) not in seen:
                crew_list.append(CrewMember(name=name, job=job))
                seen.add((name, job))
    except Exception:
        pass

    # Get extra fields from raw CSV
    raw_movies = pd.read_csv('tmdb_5000_movies.csv')
    raw_row = raw_movies[raw_movies['id'] == movie_id]
    budget = revenue = vote_count = 0
    spoken_languages = []
    production_companies = []
    status = ""
    if not raw_row.empty:
        r = raw_row.iloc[0]
        budget = int(r['budget']) if pd.notna(r['budget']) else 0
        revenue = int(r['revenue']) if pd.notna(r['revenue']) else 0
        vote_count = int(r['vote_count']) if pd.notna(r['vote_count']) else 0
        status = str(r['status']) if pd.notna(r['status']) else ''
        try:
            spoken_languages = [l['name'] for l in ast.literal_eval(r['spoken_languages'])]
        except Exception:
            pass
        try:
            production_companies = [c['name'] for c in ast.literal_eval(r['production_companies'])]
        except Exception:
            pass

    poster_url = await fetch_poster_url(movie_id)

    return MovieDetailResponse(
        id=movie_id,
        title=movie['title'],
        overview=movie['overview'] if pd.notna(movie['overview']) else '',
        poster_url=poster_url,
        vote_average=float(movie['vote_average']),
        vote_count=vote_count,
        release_date=str(movie['release_date']),
        genres=movie['genres_list'] if isinstance(movie['genres_list'], list) else [],
        runtime=float(movie['runtime']) if pd.notna(movie['runtime']) else 0.0,
        tagline=str(movie['tagline']) if pd.notna(movie['tagline']) else '',
        director=str(movie['director_name']) if pd.notna(movie.get('director_name')) else '',
        cast=cast_list,
        crew=crew_list,
        budget=budget,
        revenue=revenue,
        spoken_languages=spoken_languages,
        production_companies=production_companies,
        status=status,
    )

@app.get("/genres")
async def get_genres():
    """Get all unique genres with movie counts"""
    global movies_data

    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")

    genre_counts = {}
    for genres_list in movies_data['genres_list']:
        if isinstance(genres_list, list):
            for g in genres_list:
                genre_counts[g] = genre_counts.get(g, 0) + 1

    genres = [{"name": name, "count": count} for name, count in sorted(genre_counts.items())]
    return {"genres": genres}


@app.get("/movies-by-genre", response_model=list[MovieResponse])
async def get_movies_by_genre(genre: str = Query(..., min_length=1)):
    """Get top movies for a specific genre, sorted by rating"""
    global movies_data

    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")

    genre_lower = genre.strip().lower()
    mask = movies_data['genres_list'].apply(
        lambda gs: any(g.lower() == genre_lower for g in gs) if isinstance(gs, list) else False
    )
    filtered = movies_data[mask].copy()

    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"No movies found for genre '{genre}'")

    # Get vote counts & filter for quality, then sort
    raw = pd.read_csv('tmdb_5000_movies.csv')[['id', 'vote_count']]
    filtered = filtered.merge(raw, on='id', how='left')
    qualified = filtered[filtered['vote_count'] >= 100].nlargest(20, 'vote_average')
    if qualified.empty:
        qualified = filtered.nlargest(20, 'vote_average')

    ids = [int(row['id']) for _, row in qualified.iterrows()]
    poster_urls = await asyncio.gather(*[fetch_poster_url(mid) for mid in ids])

    results = []
    for i, (_, movie) in enumerate(qualified.iterrows()):
        results.append(MovieResponse(
            id=int(movie['id']),
            title=movie['title'],
            overview=movie['overview'] if pd.notna(movie['overview']) else '',
            poster_url=poster_urls[i],
            vote_average=float(movie['vote_average']),
            release_date=str(movie['release_date']),
            genres=movie['genres_list'] if isinstance(movie['genres_list'], list) else [],
            runtime=float(movie['runtime']) if pd.notna(movie['runtime']) else 0.0,
            tagline=str(movie['tagline']) if pd.notna(movie['tagline']) else '',
            director=str(movie['director_name']) if pd.notna(movie.get('director_name')) else ''
        ))
    return results


@app.get("/movies")
async def get_all_movies():
    """Get list of all available movies for autocomplete"""
    global movies_data
    
    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
    
    return {"movies": movies_data['title'].tolist()}

@app.get("/autocomplete")
async def autocomplete(q: str = Query(..., min_length=1)):
    """Get movie suggestions based on partial input with fuzzy matching"""
    global movies_data
    
    if movies_data is None:
        raise HTTPException(status_code=503, detail="Data not loaded yet")
    
    query = q.strip()
    
    if not query:
        return {"suggestions": []}
    
    # Get all movie titles
    all_titles = movies_data['title'].tolist()
    
    # Filter titles that contain the query (case-insensitive)
    query_lower = query.lower()
    exact_matches = [title for title in all_titles if query_lower in title.lower()]
    
    # If we have enough exact matches, return them
    if len(exact_matches) >= 10:
        return {"suggestions": sorted(exact_matches[:10])}
    
    # Otherwise, add fuzzy matches
    fuzzy_matches = process.extract(query, all_titles, scorer=fuzz.token_sort_ratio, limit=15)
    
    # Combine exact and fuzzy matches, remove duplicates, and sort by relevance
    all_matches = exact_matches + [match[0] for match in fuzzy_matches if match[0] not in exact_matches and match[1] >= 60]
    
    # Return top 10 suggestions
    return {"suggestions": all_matches[:10]}
