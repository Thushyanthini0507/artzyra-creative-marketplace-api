# Vercel Deployment Guide

## ✅ Fixed Issues

1. ✅ Fixed typo: `versel.json` → `vercel.json`
2. ✅ Created proper serverless function entry point: `api/index.js`
3. ✅ Updated `vercel.json` with correct paths
4. ✅ Modified `app.js` to work in both local and Vercel environments
5. ✅ Updated database connection to handle serverless environment

## 📁 Files Created/Updated

### 1. `vercel.json` (Fixed)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### 2. `api/index.js` (New - Serverless Entry Point)

This file exports your Express app for Vercel's serverless functions.

### 3. `.vercelignore` (New)

Excludes unnecessary files from deployment.

## 🚀 Deployment Steps

### Step 1: Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

### Step 4: Set Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

1. **MONGO_URI**

   ```
   mongodb+srv://thushyanthini0507_db_user:thusi0507@artzyra.zd9ep8g.mongodb.net/artzyra_db?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**

   ```
   your-super-secret-jwt-key-change-this-in-production-min-32-characters-long
   ```

3. **JWT_EXPIRES_IN** (optional)

   ```
   7d
   ```

4. **NODE_ENV** (optional)
   ```
   production
   ```

## 🔧 Important Notes

### Environment Variables

- **Never commit `.env` file** - it's already in `.gitignore`
- Set all environment variables in Vercel Dashboard
- Vercel automatically injects these as `process.env.*`

### Database Connection

- The database connection is now serverless-friendly
- It won't exit the process in Vercel environment
- Connection is established on first request

### CORS

- CORS is enabled for all origins
- Update `cors()` configuration in `src/app.js` if you need to restrict origins:
  ```javascript
  app.use(
    cors({
      origin: ["https://your-frontend-domain.com"],
      credentials: true,
    })
  );
  ```

## 🧪 Testing Deployment

After deployment, test these endpoints:

1. **Health Check:**

   ```
   GET https://your-app.vercel.app/health
   ```

2. **API Base:**

   ```
   GET https://your-app.vercel.app/api/categories
   ```

3. **Login:**
   ```
   POST https://your-app.vercel.app/api/auth/login
   ```

## 🐛 Troubleshooting

### Issue: "Cannot find module"

- Make sure all dependencies are in `package.json`
- Run `npm install` before deploying
- Check that `api/index.js` exists

### Issue: "Database connection failed"

- Verify `MONGO_URI` is set in Vercel environment variables
- Check MongoDB Atlas network access (whitelist Vercel IPs or use `0.0.0.0/0`)
- Ensure database user has proper permissions

### Issue: "Route not found"

- Check `vercel.json` routes configuration
- Verify all routes are properly exported from `app.js`
- Check Vercel function logs in dashboard

### Issue: "Timeout"

- Vercel free tier has 10-second timeout for serverless functions
- Optimize database queries
- Consider upgrading to Pro plan for longer timeouts

## 📊 Monitoring

- Check Vercel Dashboard → Functions for logs
- Monitor function execution time
- Check error rates in Analytics

## 🔄 Continuous Deployment

If connected to GitHub:

1. Push to `main` branch = Production deployment
2. Push to other branches = Preview deployment
3. Environment variables are automatically used

## 📝 API Base URL

After deployment, your API base URL will be:

```
https://your-app-name.vercel.app/api
```

Update your frontend to use this URL instead of `localhost:8000`.
