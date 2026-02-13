# Deployment Guide

This guide covers deploying the Movie Recommendation System to Heroku (backend) and Vercel (frontend).

## Prerequisites

- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli
- Vercel CLI installed: `npm install -g vercel`
- Git repository initialized
- TMDB API key from https://www.themoviedb.org/settings/api

## Backend Deployment (Heroku)

### 1. Prepare the Heroku App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Or if you already have an app
heroku apps
```

### 2. Set Environment Variables

```bash
# Set the TMDB API key
heroku config:set TMDB_API_KEY=your_tmdb_api_key_here -a your-app-name

# Set the frontend URL (update with your Vercel URL after deployment)
heroku config:set FRONTEND_URL=https://your-app.vercel.app -a your-app-name
```

### 3. Deploy to Heroku

```bash
# Add Heroku remote (if not created automatically)
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main

# View logs
heroku logs --tail -a your-app-name
```

### 4. Verify Backend is Running

```bash
heroku open -a your-app-name
# Should show FastAPI docs at /docs
```

Your backend will be available at: `https://your-app-name.herokuapp.com`

## Frontend Deployment (Vercel)

### 1. Set Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=https://your-app-name.herokuapp.com
```

Or set it in Vercel Dashboard:
- Go to Settings → Environment Variables
- Add `VITE_API_BASE_URL` with value `https://your-app-name.herokuapp.com`

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your repository
5. Set environment variables in the dashboard
6. Click "Deploy"

### 3. Update Backend CORS

Once you have your Vercel URL, update the backend environment variable:

```bash
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app -a your-app-name
```

## Environment Variables Reference

### Backend (.env on Heroku)
- `TMDB_API_KEY` - Your TMDB API key
- `FRONTEND_URL` - Your Vercel frontend URL (for CORS)
- `PORT` - Server port (auto-set by Heroku)

### Frontend (.env.local / Vercel)
- `VITE_API_BASE_URL` - Your Heroku backend URL

## File Structure for Deployment

```
├── Procfile                    # Heroku startup command
├── runtime.txt                 # Python version for Heroku
├── requirements.txt            # Python dependencies
├── vercel.json                 # Vercel configuration
├── .env.example               # Environment variables template
├── main.py                     # FastAPI backend
├── package.json                # Node dependencies
├── vite.config.js             # Vite build config
└── src/
    └── components/
        └── MovieSearch.jsx    # Uses VITE_API_BASE_URL
```

## Troubleshooting

### Backend Issues (Heroku)

1. **CSV files not found**
   - Ensure `tmdb_5000_movies.csv` and `tmdb_5000_credits.csv` are committed to git
   - Check with: `heroku config -a your-app-name`

2. **Port errors**
   - Heroku automatically assigns PORT environment variable
   - The Procfile uses this automatically

3. **CORS errors**
   - Make sure `FRONTEND_URL` is set correctly
   - Check: `heroku config -a your-app-name`

### Frontend Issues (Vercel)

1. **API calls failing**
   - Verify `VITE_API_BASE_URL` environment variable is set
   - Check browser Console for exact URL being used

2. **Build failures**
   - Check Vercel build logs in dashboard
   - Ensure all dependencies are in `package.json`

3. **Environment variables not loading**
   - Vercel requires rebuild after changing env vars
   - Redeploy after setting variables

## Performance Optimization

### Heroku
- The app uses 4 Uvicorn workers for better concurrency
- Data is cached in memory after first load
- Poster URLs are cached in `poster_cache.json`

### Vercel
- Frontend is statically built and CDN-cached
- Vite tree-shaking removes unused code
- Build output is in the `dist/` folder

## Local Testing

Test the production-like configuration locally:

```bash
# Create .env with your settings
cat > .env << EOF
TMDB_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
EOF

# Run backend
pip install -r requirements.txt
uvicorn main:app --reload

# In another terminal, run frontend
npm install
npm run dev
```

## Common Deployment Commands

```bash
# View Heroku logs
heroku logs -t -a your-app-name

# Restart Heroku app
heroku restart -a your-app-name

# View Heroku config
heroku config -a your-app-name

# Redeploy on Vercel (from git)
git push  # pushes to GitHub
# Vercel auto-deploys on push to main

# Manual Vercel redeploy
vercel --prod
```

## Cost Considerations

- **Heroku**: Free tier available but with limitations; paid dynos start at $7/month
- **Vercel**: Generous free tier for frontend hosting
- **Large-scale**: Consider AWS, Railway, or Render for better pricing

## Next Steps

1. Monitor both deployments for errors
2. Test the recommendation feature thoroughly
3. Consider adding monitoring/logging (e.g., Sentry)
4. Set up CI/CD pipeline for automatic deployments
5. Implement caching headers for better performance
