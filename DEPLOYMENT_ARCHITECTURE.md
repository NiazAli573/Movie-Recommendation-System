# Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / Client                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
        ┌──────────▼──────────┐   ┌──▼──────────────┐
        │   Vercel (CDN)      │   │   Alt: Netlify  │
        │   Frontend React    │   │   Alt: GitHub   │
        │                     │   │   Pages         │
        │  - Vite Build       │   └─────────────────┘
        │  - Tailwind CSS     │
        │  - Dist/ folder     │
        │  - /docs endpoint   │
        └──────────┬──────────┘
                   │
     ┌─────────────▼────────────────┐
     │  Calls API_BASE_URL (env var) │
     └─────────────┬────────────────┘
                   │
        ┌──────────▼──────────────┐
        │   Heroku (Backend)      │
        │   FastAPI + Uvicorn     │
        │                         │
        │  - Procfile             │
        │  - runtime.txt          │
        │  - Gunicorn + 4 workers │
        │  - Port: Dynamic (env)  │
        │  - CORS configured      │
        └──────────┬──────────────┘
                   │
        ┌──────────▼──────────────┐
        │  Data Processing Layer  │
        │                         │
        │  - Pandas processing    │
        │  - Scikit-learn MLM     │
        │  - Cache management     │
        └──────────┬──────────────┘
                   │
        ┌──────────▼──────────────┐
        │    CSV Data Files       │
        │                         │
        │  - Movies dataset       │
        │  - Credits dataset      │
        │  - Poster cache         │
        └─────────────────────────┘
```

---

## File Structure After Deployment

```
Project Root
├── Backend Files (Heroku)
│   ├── Procfile ..................... Heroku startup config
│   ├── runtime.txt .................. Python version
│   ├── requirements.txt ............. Python dependencies
│   ├── main.py ...................... FastAPI app
│   ├── tmdb_5000_movies.csv ......... Dataset
│   ├── tmdb_5000_credits.csv ........ Dataset
│   └── poster_cache.json ............ Cached poster URLs
│
├── Frontend Files (Vercel)
│   ├── vercel.json .................. Vercel config
│   ├── package.json ................. Node dependencies
│   ├── vite.config.js ............... Build config
│   ├── index.html ................... Entry point
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       └── MovieSearch.jsx (uses VITE_API_BASE_URL)
│   └── dist/ ........................ Build output (generated)
│
├── Configuration
│   ├── .env.example ................. Environment template
│   ├── .gitignore ................... Git ignore rules
│   ├── DEPLOYMENT_GUIDE.md .......... Detailed instructions
│   └── DEPLOYMENT_CHECKLIST.md ...... Quick checklist
│
└── Documentation
    └── README.md .................... Project info
```

---

## Environment Variables Flow

### Development (`npm run dev` + `uvicorn main:app --reload`)
```
Frontend: VITE_API_BASE_URL = http://localhost:8000
Backend:  FRONTEND_URL = (empty/not used for CORS)
          TMDB_API_KEY = (from .env)
```

### Production on Heroku + Vercel
```
Vercel Dashboard:
  VITE_API_BASE_URL = https://your-app-name.herokuapp.com

Heroku Dashboard:
  TMDB_API_KEY = your_tmdb_key_here
  FRONTEND_URL = https://your-project.vercel.app
```

---

## Deployment Services Comparison

| Feature | Heroku | Alternative |
|---------|--------|-------------|
| Backend (Python/FastAPI) | ✅ Excellent | Railway, Render, PythonAnywhere |
| Node Proxy | ✅ Possible | Same services |
| Free Tier | ⚠ Limited | Railway ($5/mo), Render |
| Dyno Sleep | ⚠ Yes (free) | No (paid only) |
| Startup Time | ~2-10 sec | Usually faster |

| Feature | Vercel | Alternative |
|---------|--------|-------------|
| React/Vite Frontend | ✅ Perfect | Netlify, GitHub Pages, AWS |
| Auto Deploy (GitHub) | ✅ Yes | Netlify (yes), GitHub Pages (yes) |
| Free Tier | ✅ Generous | Netlify (generous), GitHub Pages (free) |
| Edge Functions | ✅ Yes | Netlify (yes) |
| Build Speed | ⚡ Fast | Comparable |

---

## API Endpoints (After Deployment)

All endpoints available at: `https://your-app-name.herokuapp.com`

```
GET  /                      Health check
GET  /docs                  Swagger UI documentation
GET  /redoc                 ReDoc documentation
GET  /movies                List all movies
GET  /autocomplete?q=...    Movie search suggestions
POST /recommend             Get recommendations
GET  /movie/{movieId}       Get movie details
```

**Example Request:**
```bash
curl -X POST https://your-app-name.herokuapp.com/recommend \
  -H "Content-Type: application/json" \
  -d '{"title": "Avatar"}'
```

---

## Key Configuration Changes

### Modified Files
1. **main.py** - Dynamic CORS with env variables
2. **MovieSearch.jsx** - Uses `import.meta.env.VITE_API_BASE_URL`
3. **vite.config.js** - Passes env var to frontend
4. **requirements.txt** - Added gunicorn and other dependencies

### New Files
1. **Procfile** - Heroku app startup
2. **runtime.txt** - Python version specification
3. **vercel.json** - Vercel build config
4. **.env.example** - Environment variable template
5. **DEPLOYMENT_*.md** - Deployment guides

---

## Cost Estimation (Monthly)

### Minimum Setup
- **Heroku**: $0/month (free tier, limited) or $7+/month (paid)
- **Vercel**: $0/month (free tier)
- **Total**: $0-$7/month

### Recommended Setup
- **Heroku**: $25/month (standard-1X dyno)
- **Vercel**: $0/month (free tier)
- **Total**: $25/month

### Production Setup
- **Heroku**: $100+/month (professional dynos)
- **Vercel Pro**: $20/month (optional for advanced features)
- **Total**: $100+/month

---

## Monitoring & Logs

### Heroku
```bash
# View logs in real-time
heroku logs -t -a your-app-name

# View logs for specific component
heroku logs --source app -a your-app-name
```

### Vercel
- Check in Vercel Dashboard → Deployments → View Logs
- Or in CLI: `vercel logs`

### Local Development
```bash
# Backend logs
uvicorn main:app --reload --log-level debug

# Frontend logs
npm run dev
# Check browser console F12
```

---

## Security Considerations

✅ **Implemented:**
- CORS configured for allowed origins only
- Environment variables for sensitive data
- API key stored in env var (not in code)
- HTTPS enforced by deployment services

⚠ **Recommended:**
- Add rate limiting to API endpoints
- Implement API authentication/key system
- Use HTTPS only (default on Heroku/Vercel)
- Monitor API usage and errors
- Consider API versioning

---

## Performance Tips

✅ **Frontend (Vercel)**
- Files are CDN-distributed globally
- Automatic GZIP compression
- Image optimization available
- Static assets cached

✅ **Backend (Heroku)**
- 4 Uvicorn workers for concurrent requests
- In-memory data caching (fast lookups)
- Poster URL caching reduces API calls
- Consider Redis for multi-dyno scaling

---

## Next Steps

1. ✅ Create Heroku and Vercel accounts
2. ✅ Deploy backend to Heroku
3. ✅ Deploy frontend to Vercel
4. ✅ Test recommendation feature end-to-end
5. ✅ Monitor logs for errors
6. ✅ Share application URL
7. 📊 Consider adding analytics (Google Analytics)
8. 🔐 Plan security upgrades for production
