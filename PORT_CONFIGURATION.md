# Port Configuration Guide

## Current Configuration

**Server Port:** `3000` (from `.env` file)
**Base URL:** `http://localhost:3000`
**API Base:** `http://localhost:3000/api`

## Port Settings

### In `.env` file:
```env
PORT=3000
```

### In `src/app.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

## To Change Port to 8000

1. **Update `.env` file:**
   ```env
   PORT=8000
   ```

2. **Restart server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **New URLs:**
   - Base: `http://localhost:8000`
   - API: `http://localhost:8000/api`
   - Health: `http://localhost:8000/health`

## Testing Endpoints

### Current Port (3000):
```bash
# Health check
curl http://localhost:3000/health

# Get categories
curl http://localhost:3000/api/categories

# Get artists
curl http://localhost:3000/api/artists

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@artzyra.com","password":"admin123"}'
```

### If Changed to 8000:
```bash
# Replace 3000 with 8000 in all URLs
curl http://localhost:8000/health
curl http://localhost:8000/api/categories
```

## Vercel Deployment

For Vercel, the port is automatically handled. You don't need to set PORT in environment variables for Vercel - it uses serverless functions.

## Important Notes

- ✅ Server is currently running on **port 3000**
- ✅ All endpoints are accessible at `http://localhost:3000/api/*`
- ✅ Health check: `http://localhost:3000/health`
- ⚠️ If you want port 8000, update `.env` and restart

