import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const API_BASE = 'http://localhost:8000';

/* ─────────────────── helpers ─────────────────── */
const formatRuntime = (mins) => {
  if (!mins || mins <= 0) return '';
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
};
const formatMoney = (n) => {
  if (!n) return null;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

/* ─────────────────── Star Rating ─────────────────── */
const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1.5">
    <svg className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span className="text-sm font-medium text-amber-400">{rating.toFixed(1)}</span>
    {count > 0 && <span className="text-sm text-gray-500">({count.toLocaleString()})</span>}
  </div>
);

/* ─────────────────── Movie Detail Modal ─────────────────── */
const MovieDetailModal = ({ movieId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const backdropRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE}/movie/${movieId}`);
        if (res.ok) setDetail(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchDetail();
    return () => { document.body.style.overflow = ''; };
  }, [movieId]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdrop = (e) => { if (e.target === backdropRef.current) onClose(); };

  const year = detail?.release_date ? detail.release_date.split('-')[0] : '';
  const duration = formatRuntime(detail?.runtime);

  const crewByRole = {};
  detail?.crew?.forEach((c) => {
    const label =
      c.job === 'Screenplay' ? 'Writer' :
      c.job === 'Original Music Composer' ? 'Music' :
      c.job === 'Director of Photography' ? 'Cinematography' :
      c.job === 'Executive Producer' ? 'Exec. Producer' :
      c.job;
    if (!crewByRole[label]) crewByRole[label] = [];
    crewByRole[label].push(c.name);
  });

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10 px-4 animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="relative w-full max-w-3xl bg-gray-900 rounded-lg border border-white/10 overflow-hidden animate-[fadeUp_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 min-h-[300px]">
            <svg className="animate-spin h-8 w-8 text-amber-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-400">Loading movie details…</span>
          </div>
        ) : !detail ? (
          <div className="p-12 text-center text-gray-500 text-sm">Failed to load details.</div>
        ) : (
          <>
            {/* ── Hero: poster + info ── */}
            <div className="flex flex-col sm:flex-row">
              {/* Poster */}
              <div className="sm:w-[260px] shrink-0">
                {detail.poster_url ? (
                  <img src={detail.poster_url} alt={detail.title} className="w-full h-auto sm:h-full object-cover" />
                ) : (
                  <div className="w-full h-[380px] flex items-center justify-center bg-black/40 text-gray-600">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-6 flex flex-col">
                <h2 className="text-2xl font-medium text-white leading-snug">
                  {detail.title}
                  {year && <span className="text-gray-500 font-normal text-base ml-2">({year})</span>}
                </h2>

                {detail.tagline && (
                  <p className="text-sm text-gray-500 italic mt-1">"{detail.tagline}"</p>
                )}

                {/* Rating + meta */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {detail.vote_average > 0 && (
                    <StarRating rating={detail.vote_average} count={detail.vote_count || 0} />
                  )}
                  {duration && <span className="text-sm text-gray-400">{duration}</span>}
                  {detail.status && detail.status !== 'Released' && (
                    <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-medium">{detail.status}</span>
                  )}
                </div>

                {/* Genres */}
                {detail.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {detail.genres.map((g) => (
                      <span key={g} className="px-3 py-1 text-xs rounded-full border border-white/20 text-white">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Director */}
                {detail.director && (
                  <div className="mt-4 text-sm">
                    <span className="text-gray-500">Directed by</span>{' '}
                    <span className="text-white font-medium">{detail.director}</span>
                  </div>
                )}

                {/* Budget / Revenue */}
                {(detail.budget > 0 || detail.revenue > 0) && (
                  <div className="flex gap-6 mt-4 text-sm">
                    {detail.budget > 0 && (
                      <div>
                        <span className="text-gray-500">Budget </span>
                        <span className="text-gray-300 font-medium">{formatMoney(detail.budget)}</span>
                      </div>
                    )}
                    {detail.revenue > 0 && (
                      <div>
                        <span className="text-gray-500">Revenue </span>
                        <span className="text-gray-300 font-medium">{formatMoney(detail.revenue)}</span>
                      </div>
                    )}
                  </div>
                )}

                {detail.spoken_languages?.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">
                    {detail.spoken_languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* ── Overview ── */}
            <div className="px-6 py-6 border-t border-white/10">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Overview</h3>
              <p className="text-base text-gray-300 leading-relaxed">
                {detail.overview || 'No description available.'}
              </p>
            </div>

            {/* ── Cast ── */}
            {detail.cast?.length > 0 && (
              <div className="px-6 py-6 border-t border-white/10">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  {detail.cast.map((c, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-sm text-white">{c.name}</span>
                      {c.character && (
                        <span className="text-xs text-gray-500">as {c.character}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Crew ── */}
            {Object.keys(crewByRole).length > 0 && (
              <div className="px-6 py-6 border-t border-white/10">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Crew</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  {Object.entries(crewByRole).map(([role, names]) => (
                    <div key={role} className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{role}</span>
                      <span className="text-sm text-gray-300">{names.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Production ── */}
            {detail.production_companies?.length > 0 && (
              <div className="px-6 py-6 border-t border-white/10">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Production</h3>
                <p className="text-sm text-gray-500">{detail.production_companies.join(' · ')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────── Movie Card ─────────────────── */
const MovieCard = ({ movie, rank, onClick }) => {
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const hours = Math.floor(movie.runtime / 60);
  const mins  = Math.round(movie.runtime % 60);
  const duration = movie.runtime > 0 ? `${hours}h ${mins}m` : '';

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="rounded-lg overflow-hidden bg-gray-900 border border-white/10 hover:border-white/20 transition-colors duration-300">
        <div className="flex">
          {/* Poster with hover scale */}
          <div className="relative w-[130px] sm:w-[150px] shrink-0 overflow-hidden aspect-[2/3]">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40 text-gray-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            )}
            {/* Rank badge */}
            {rank != null && (
              <div className="absolute top-2 left-2 min-w-[24px] h-[24px] px-1.5 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-black">
                {rank}
              </div>
            )}
            {/* Poster gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Info */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
            {/* Rating */}
            {movie.vote_average > 0 && (
              <div className="mb-2">
                <StarRating rating={movie.vote_average} count={0} />
              </div>
            )}

            {/* Title */}
            <h3 className="text-base font-medium text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-amber-400 transition-colors duration-300">
              {movie.title}
            </h3>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400 mb-2">
              {year && <span>{year}</span>}
              {duration && <><span className="text-gray-600">·</span><span>{duration}</span></>}
              {movie.director && <><span className="text-gray-600">·</span><span className="text-gray-300">{movie.director}</span></>}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {movie.genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-2 py-0.5 text-xs rounded-full border border-white/10 text-gray-400">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mt-auto">
              {movie.overview || 'No description available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Skeleton Card ─────────────────── */
const SkeletonCard = () => (
  <div className="rounded-lg overflow-hidden bg-gray-900 border border-white/10">
    <div className="flex">
      <div className="w-[130px] sm:w-[150px] shrink-0 aspect-[2/3] skeleton" />
      <div className="flex-1 p-4 sm:p-5 space-y-3">
        <div className="h-4 skeleton rounded w-16" />
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-3.5 skeleton rounded w-1/2" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 skeleton rounded-full" />
          <div className="h-5 w-14 skeleton rounded-full" />
        </div>
        <div className="space-y-2 pt-1">
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-full" />
          <div className="h-3 skeleton rounded w-2/3" />
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────── Hero Banner ─────────────────── */
const HeroBanner = ({ movie, onSearch, onDetail }) => {
  if (!movie) return null;

  return (
    <div className="relative rounded-xl overflow-hidden mb-8 group cursor-pointer" onClick={() => onDetail(movie.id)}>
      {/* Background image */}
      <div className="aspect-[3/1] max-h-[260px] overflow-hidden">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-white mb-1">{movie.title}</h2>
          {movie.overview && (
            <p className="text-sm text-gray-300 line-clamp-1 mb-3">{movie.overview}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onSearch(movie.title); }}
              className="bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-300"
            >
              Find Similar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDetail(movie.id); }}
              className="border border-white/20 bg-black/40 text-white text-sm px-5 py-2.5 rounded-full hover:bg-white/20 transition-colors duration-300"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────── Main Component ──────────────────── */
/* ─────────────── Genre Card ─────────────── */
const GENRE_ICONS = {
  Action: '💥', Adventure: '🗺️', Animation: '🎨', Comedy: '😂', Crime: '🔪',
  Documentary: '📹', Drama: '🎭', Family: '👨‍👩‍👧‍👦', Fantasy: '🧙', History: '📜',
  Horror: '👻', Music: '🎵', Mystery: '🔍', Romance: '❤️', 'Science Fiction': '🚀',
  'TV Movie': '📺', Thriller: '😱', War: '⚔️', Western: '🤠',
};

const GenreCard = ({ genre, onClick, isSelected }) => (
  <button
    onClick={() => onClick(genre.name)}
    className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-300 text-left ${
      isSelected
        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-gray-300'
    }`}
  >
    <span className="text-xl">{GENRE_ICONS[genre.name] || '🎬'}</span>
    <div className="flex flex-col">
      <span className="text-sm font-medium">{genre.name}</span>
      <span className="text-xs text-gray-500">{genre.count} films</span>
    </div>
  </button>
);

/* ──────────────────── Main Component ──────────────────── */
const MovieSearch = forwardRef(({ activeSection = 'home', onSectionChange }, ref) => {
  const [movieTitle, setMovieTitle]         = useState('');
  const [searchedTitle, setSearchedTitle]   = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [topMovies, setTopMovies]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [topLoading, setTopLoading]         = useState(true);
  const [error, setError]                   = useState('');
  const [suggestions, setSuggestions]       = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex]   = useState(-1);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [genres, setGenres]                 = useState([]);
  const [selectedGenre, setSelectedGenre]   = useState('');
  const [genreMovies, setGenreMovies]       = useState([]);
  const [genreLoading, setGenreLoading]     = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef       = useRef(null);

  /* ── Expose methods to parent via ref ── */
  useImperativeHandle(ref, () => ({
    resetToHome() {
      setMovieTitle('');
      setSearchedTitle('');
      setRecommendations([]);
      setError('');
      setSelectedGenre('');
      setGenreMovies([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    focusSearch() {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    showGenres() {
      setRecommendations([]);
      setSearchedTitle('');
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    showTopRated() {
      setRecommendations([]);
      setSearchedTitle('');
      setError('');
      setSelectedGenre('');
      setGenreMovies([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  }));

  /* ── Load top movies on mount ── */
  useEffect(() => {
    const loadTopMovies = async () => {
      try {
        const res = await fetch(`${API_BASE}/top-movies`);
        if (res.ok) setTopMovies(await res.json());
      } catch { /* silent */ }
      finally { setTopLoading(false); }
    };
    loadTopMovies();
  }, []);

  /* ── Load genres ── */
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetch(`${API_BASE}/genres`);
        if (res.ok) {
          const data = await res.json();
          setGenres(data.genres || []);
        }
      } catch { /* silent */ }
    };
    loadGenres();
  }, []);

  /* ── Load movies when genre is selected ── */
  useEffect(() => {
    if (!selectedGenre) { setGenreMovies([]); return; }
    const loadGenreMovies = async () => {
      setGenreLoading(true);
      try {
        const res = await fetch(`${API_BASE}/movies-by-genre?genre=${encodeURIComponent(selectedGenre)}`);
        if (res.ok) setGenreMovies(await res.json());
      } catch { /* silent */ }
      finally { setGenreLoading(false); }
    };
    loadGenreMovies();
  }, [selectedGenre]);

  /* ── Autocomplete ── */
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (movieTitle.trim().length < 2) { setSuggestions([]); return; }
      try {
        const res = await fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(movieTitle)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch { /* silent */ }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [movieTitle]);

  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Keyboard nav ── */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleRecommend(e);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) selectSuggestion(suggestions[selectedIndex]);
      else handleRecommend(e);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const selectSuggestion = (s) => {
    setMovieTitle(s);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  /* ── Recommend ── */
  const handleRecommend = async (e) => {
    e.preventDefault();
    if (!movieTitle.trim()) { setError('Please enter a movie title'); return; }
    setShowSuggestions(false);
    setLoading(true);
    setError('');
    setRecommendations([]);
    setSearchedTitle(movieTitle);

    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: movieTitle }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to get recommendations');
      }
      setRecommendations(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSearch = (title) => {
    setMovieTitle(title);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      setShowSuggestions(false);
      setLoading(true);
      setError('');
      setRecommendations([]);
      setSearchedTitle(title);
      fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
        .then(res => {
          if (!res.ok) return res.json().then(e => { throw new Error(e.detail); });
          return res.json();
        })
        .then(setRecommendations)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, 0);
  };

  const clearSearch = () => {
    setMovieTitle('');
    setSearchedTitle('');
    setRecommendations([]);
    setError('');
  };

  const showingResults = recommendations.length > 0 || loading;

  return (
    <div>
      {/* ── Search Bar (always at top) ── */}
      <form id="search-section" onSubmit={handleRecommend} className="mb-6">
        <div className="max-w-2xl mx-auto relative">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for a movie…"
                className="w-full pl-11 pr-4 py-3 rounded-full text-sm bg-white/[0.08] backdrop-blur-md text-white placeholder-gray-400 border border-white/15 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors duration-300"
              />

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-20 w-full mt-2 rounded-lg bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl max-h-64 overflow-y-auto"
                >
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className={`px-4 py-3 cursor-pointer text-sm transition-colors duration-300 ${
                        i === selectedIndex
                          ? 'bg-white/10 text-amber-400'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full text-sm font-medium bg-amber-500 hover:bg-amber-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black transition-colors duration-300"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Searching
                </span>
              ) : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* ── Hero Section (only on home when no results) ── */}
      {activeSection === 'home' && !showingResults && !error && !topLoading && topMovies.length > 0 && (
        <HeroBanner
          movie={topMovies[0]}
          onSearch={triggerSearch}
          onDetail={setSelectedMovieId}
        />
      )}

      {/* ── Error ── */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Recommendations ── */}
      {showingResults && (
        <section className="animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium text-white">
                {loading ? 'Finding similar movies…' : (
                  <>Similar to <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">{searchedTitle}</span></>
                )}
              </h2>
              {!loading && recommendations.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{recommendations.length} movies found</p>
              )}
            </div>
            {!loading && (
              <button
                onClick={clearSearch}
                className="text-sm text-gray-400 hover:text-amber-400 transition-colors duration-300 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading
              ? [1,2,3,4,5].map((i) => <SkeletonCard key={i} />)
              : recommendations.map((m, i) => <MovieCard key={m.id} movie={m} rank={i + 1} onClick={() => setSelectedMovieId(m.id)} />)
            }
          </div>
        </section>
      )}

      {/* ── Genres Section ── */}
      {activeSection === 'genres' && !showingResults && !error && (
        <section className="animate-[fadeIn_0.3s_ease-out]">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-white">Browse by Genre</h2>
            <p className="text-sm text-gray-500 mt-1">Explore movies across all genres</p>
          </div>

          {/* Genre grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {genres.map((g) => (
              <GenreCard
                key={g.name}
                genre={g}
                isSelected={selectedGenre === g.name}
                onClick={(name) => setSelectedGenre(selectedGenre === name ? '' : name)}
              />
            ))}
          </div>

          {/* Genre movies */}
          {selectedGenre && (
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <h3 className="text-xl font-medium text-white">
                    {GENRE_ICONS[selectedGenre] || '🎬'} {selectedGenre}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Top rated {selectedGenre.toLowerCase()} films</p>
                </div>
                <button
                  onClick={() => setSelectedGenre('')}
                  className="text-sm text-gray-400 hover:text-amber-400 transition-colors duration-300"
                >
                  Clear
                </button>
              </div>
              {genreLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : genreMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {genreMovies.map((m, i) => (
                    <MovieCard key={m.id} movie={m} rank={i + 1} onClick={() => setSelectedMovieId(m.id)} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-8 text-center">No movies found for this genre.</p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Top Rated (home default & toprated section) ── */}
      {(activeSection === 'home' || activeSection === 'toprated' || activeSection === 'discover') && !showingResults && !error && (
        <section id="top-rated-section" className="animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium text-white">Top Rated</h2>
              <p className="text-sm text-gray-500 mt-1">Highest rated films with 1,000+ reviews</p>
            </div>
          </div>

          {topLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : topMovies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeSection === 'home' ? topMovies.slice(1) : topMovies).map((m, i) => (
                <MovieCard key={m.id} movie={m} rank={activeSection === 'home' ? i + 2 : i + 1} onClick={() => setSelectedMovieId(m.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Could not load top movies. Make sure the backend is running.</p>
            </div>
          )}
        </section>
      )}

      {/* ── Detail Modal ── */}
      {selectedMovieId && (
        <MovieDetailModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  );
});

MovieSearch.displayName = 'MovieSearch';

export default MovieSearch;
