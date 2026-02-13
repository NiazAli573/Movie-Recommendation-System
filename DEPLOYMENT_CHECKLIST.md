# Quick Deployment Checklist

## ✅ Before Deployment

- [ ] Get TMDB API key from https://www.themoviedb.org/settings/api
- [ ] Install Heroku CLI and Vercel CLI
- [ ] Have a GitHub repository created and pushed
- [ ] Test locally: `uvicorn main:app --reload` (backend) and `npm run dev` (frontend)

## ✅ Heroku Deployment (Backend)

1. **Create Heroku App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set TMDB_API_KEY=your_key -a your-app-name
   ```

3. **Deploy**
   ```bash
   heroku git:remote -a your-app-name
   git push heroku main
   ```

4. **Verify**
   ```bash
   heroku open -a your-app-name
   # Check /docs for API documentation
   ```

**Backend URL**: `https://your-app-name.herokuapp.com`

---

## ✅ Vercel Deployment (Frontend)

1. **Option A - Vercel CLI**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Option B - GitHub Integration**
   - Push to GitHub
   - Go to vercel.com
   - Import your repository
   - Set environment variable: `VITE_API_BASE_URL=https://your-app-name.herokuapp.com`

**Frontend URL**: `https://your-project.vercel.app`

---

## ✅ Update CORS (After both deployed)

```bash
heroku config:set FRONTEND_URL=https://your-project.vercel.app -a your-app-name
```

---

## ✅ Key Configuration Files

| File | Purpose |
|------|---------|
| `Procfile` | Heroku app startup command |
| `runtime.txt` | Python version (3.11.7) |
| `vercel.json` | Vercel build configuration |
| `.env.example` | Required environment variables |

---

## 🔗 Environment Variables

### Heroku (Backend)
```
TMDB_API_KEY=your_tmdb_key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)
```
VITE_API_BASE_URL=https://your-heroku-app.herokuapp.com
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend 404 errors | Check TMDB API key is set correctly |
| CORS errors on frontend | Verify `FRONTEND_URL` is set on Heroku |
| Frontend can't reach API | Check `VITE_API_BASE_URL` on Vercel |
| "Port already in use" | Heroku handles this automatically |

---

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting.
