# Movie Recommendation System

A full-stack movie recommendation system using content-based filtering with FastAPI backend and React frontend.

## Features

- **Content-Based Filtering**: Recommends movies based on genres, keywords, cast, crew, and plot overview
- **TMDB Dataset**: Uses TMDB 5000 Movies Dataset for recommendations
- **Modern UI**: Beautiful gradient UI with Tailwind CSS
- **Fast API**: Built with FastAPI for high-performance backend
- **Real-time Search**: Instant movie recommendations

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- Pandas
- Scikit-learn (CountVectorizer, Cosine Similarity)
- Uvicorn

### Frontend
- React 18
- Vite
- Tailwind CSS

## Installation

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:3000`

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Enter a movie title (e.g., "Avatar", "The Dark Knight")
4. Click "Recommend" to get 5 similar movie recommendations
5. View movie cards with title, overview, and metadata

## API Endpoints

- `GET /` - API health check
- `POST /recommend` - Get movie recommendations
  - Request body: `{"title": "Movie Title"}`
  - Returns: List of 5 recommended movies
- `GET /movies` - Get list of all available movies

## Project Structure

```
Movie Recommendation System/
├── main.py                          # FastAPI backend
├── requirements.txt                 # Python dependencies
├── tmdb_5000_movies.csv            # Movie dataset
├── tmdb_5000_credits.csv           # Credits dataset
├── package.json                     # Node dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── index.html                      # HTML entry point
└── src/
    ├── main.jsx                    # React entry point
    ├── App.jsx                     # Main App component
    ├── index.css                   # Global styles
    └── components/
        └── MovieSearch.jsx         # Movie search component
```

## How It Works

### Backend Processing

1. **Data Loading**: Loads movies and credits CSV files
2. **Data Cleaning**: Handles null values and parses JSON-like strings
3. **Feature Engineering**: Creates a 'tags' column by combining:
   - Movie overview
   - Genres
   - Keywords
   - Top 3 cast members
   - Director name
4. **Vectorization**: Uses CountVectorizer to convert text to numerical vectors
5. **Similarity Calculation**: Computes cosine similarity between all movies
6. **Recommendation**: Returns top 5 most similar movies based on cosine similarity scores

### Frontend Features

- **Search Input**: Enter movie titles with real-time validation
- **Loading State**: Animated skeleton loader during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Grid**: Movie cards in a responsive 3-column grid
- **Beautiful UI**: Gradient background with glassmorphism effects

## License

MIT License
