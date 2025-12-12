# Railway Deployment Guide for Hustlaa

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account (Railway connects to GitHub)
- ✅ Railway account (free at https://railway.app)
- ✅ All code pushed to GitHub
- ✅ Environment variables ready
- ✅ Paystack live API keys
- ✅ SMTP credentials (Gmail, SendGrid, etc.)
- ✅ Google Maps API key (optional but recommended)

---

## 🚀 Step 1: Prepare Your Code for Deployment

### 1.1 Create GitHub Repository

```bash
# Initialize git (if not already done)
cd /Users/admin/Desktop/hustlaa
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Hustlaa platform"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/hustlaa.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Backend Configuration

Ensure `backend/package.json` has correct start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 1.3 Verify Frontend Configuration

Ensure `frontend/package.json` has correct build script:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 1.4 Create Procfile for Backend (Optional but Recommended)

Create `backend/Procfile`:
```
web: node server.js
```

---

## 🔧 Step 2: Set Up Railway Project

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your GitHub account

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `hustlaa` repository
4. Click "Deploy"

### 2.3 Configure Services

Railway will auto-detect your project structure. You'll need to create separate services for:
- Backend (Node.js)
- Frontend (Node.js/Static)
- PostgreSQL Database

---

## 💾 Step 3: Set Up PostgreSQL Database

### 3.1 Add PostgreSQL Service
1. In Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway creates a PostgreSQL instance automatically

### 3.2 Get Database Credentials
1. Click on PostgreSQL service
2. Go to "Variables" tab
3. Copy the `DATABASE_URL` (looks like: `postgresql://user:pass@host:port/dbname`)

### 3.3 Run Database Migrations
1. In Railway, add a "Run" service
2. Use this command to run migrations:
```bash
psql $DATABASE_URL -f backend/db/schema.sql
psql $DATABASE_URL -f backend/db/migrations/002_messages.sql
psql $DATABASE_URL -f backend/db/migrations/003_password_reset.sql
psql $DATABASE_URL -f backend/db/migrations/004_wallet_system.sql
```

Or use Railway's "Shell" tab to run:
```bash
psql $DATABASE_URL < backend/db/schema.sql
psql $DATABASE_URL < backend/db/migrations/002_messages.sql
psql $DATABASE_URL < backend/db/migrations/003_password_reset.sql
psql $DATABASE_URL < backend/db/migrations/004_wallet_system.sql
```

---

## 🔌 Step 4: Deploy Backend

### 4.1 Create Backend Service
1. In Railway dashboard, click "Add Service"
2. Select "GitHub Repo"
3. Select your `hustlaa` repository
4. Set "Root Directory" to `backend`
5. Click "Deploy"

### 4.2 Configure Backend Environment Variables

In Railway Backend service → Variables tab, add:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Server
NODE_ENV=production
PORT=5000

# JWT
JWT_SECRET=generate_a_strong_random_secret_here

# Paystack (LIVE KEYS)
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="Hustlaa <no-reply@hustlaa.com>"

# Admin
ADMIN_EMAILS=admin@yourdomain.com

# Frontend URL (for password reset links)
FRONTEND_URL=https://your-frontend-domain.com
```

### 4.3 Get Backend URL
1. In Railway Backend service, go to "Settings"
2. Copy the "Public URL" (e.g., `https://hustlaa-backend.railway.app`)
3. Save this for frontend configuration

---

## 🎨 Step 5: Deploy Frontend

### 5.1 Create Frontend Service
1. In Railway dashboard, click "Add Service"
2. Select "GitHub Repo"
3. Select your `hustlaa` repository
4. Set "Root Directory" to `frontend`
5. Click "Deploy"

### 5.2 Configure Frontend Environment Variables

In Railway Frontend service → Variables tab, add:

```env
# API Configuration
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_SOCKET_URL=https://your-backend-url.railway.app

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 5.3 Configure Build Settings

In Railway Frontend service → Settings:
1. Set "Build Command" to: `npm run build`
2. Set "Start Command" to: `npm run preview`
3. Set "Root Directory" to: `frontend`

### 5.4 Get Frontend URL
1. In Railway Frontend service, go to "Settings"
2. Copy the "Public URL" (e.g., `https://hustlaa-frontend.railway.app`)

---

## 🔗 Step 6: Connect Services

### 6.1 Link Backend to Database
1. In Railway Backend service → Variables
2. Add `DATABASE_URL` from PostgreSQL service
3. Or Railway auto-links if you use the same project

### 6.2 Update Frontend API URL
1. In Railway Frontend service → Variables
2. Update `VITE_API_URL` to your backend URL
3. Update `VITE_SOCKET_URL` to your backend URL
4. Redeploy frontend

### 6.3 Update Backend Frontend URL
1. In Railway Backend service → Variables
2. Update `FRONTEND_URL` to your frontend URL
3. Redeploy backend

---

## 🌐 Step 7: Configure Custom Domain (Optional)

### 7.1 For Backend
1. In Railway Backend service → Settings
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `api.hustlaa.com.ng`)
4. Add DNS records as instructed by Railway
5. Wait for SSL certificate (automatic)

### 7.2 For Frontend
1. In Railway Frontend service → Settings
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `hustlaa.com.ng`)
4. Add DNS records as instructed by Railway
5. Wait for SSL certificate (automatic)

---

## ✅ Step 8: Verify Deployment

### 8.1 Test Backend
```bash
curl https://your-backend-url.railway.app/api/health
# Should return: {"status":"OK"}
```

### 8.2 Test Frontend
1. Open `https://your-frontend-url.railway.app` in browser
2. Should load homepage with hero image
3. Try logging in
4. Check browser console for errors

### 8.3 Test Database Connection
1. In Railway Backend service → Logs
2. Should see: "Server running on port 5000"
3. No database connection errors

### 8.4 Test Email Notifications
1. Create a new booking
2. Check email for confirmation
3. If not received, check SMTP settings

### 8.5 Test Payment
1. Go to booking details
2. Click "Pay with Paystack"
3. Use test card: 4084084084084081
4. Verify payment processes

---

## 🚨 Troubleshooting

### Backend Won't Start
**Error**: `Cannot find module 'express'`
- **Solution**: Railway didn't install dependencies
- **Fix**: In Backend service → Settings → Ensure "Install Command" is `npm install`

### Database Connection Failed
**Error**: `connect ECONNREFUSED`
- **Solution**: DATABASE_URL not set correctly
- **Fix**: Copy DATABASE_URL from PostgreSQL service variables

### Frontend Shows Blank Page
**Error**: White page with no content
- **Solution**: API URL not configured correctly
- **Fix**: Check `VITE_API_URL` in frontend variables
- **Verify**: Open browser DevTools → Network tab → Check API calls

### CORS Errors
**Error**: `Access to XMLHttpRequest blocked by CORS`
- **Solution**: Backend CORS not configured for frontend domain
- **Fix**: In `backend/server.js`, update CORS origin to include frontend URL

### Email Not Sending
**Error**: Emails not received after booking
- **Solution**: SMTP credentials incorrect
- **Fix**: Test SMTP credentials with a simple test script
- **Verify**: Check spam folder

### Paystack Payment Fails
**Error**: Payment initialization fails
- **Solution**: Using test keys in production
- **Fix**: Use live Paystack keys in production environment

---

## 📊 Monitoring & Logs

### View Logs
1. In Railway service → "Logs" tab
2. See real-time application logs
3. Useful for debugging errors

### Monitor Performance
1. In Railway service → "Metrics" tab
2. View CPU, memory, disk usage
3. View request count and latency

### Set Up Alerts (Optional)
1. In Railway project → "Settings"
2. Configure email alerts for failures
3. Get notified of deployment issues

---

## 🔄 Deployment Workflow

### For Backend Updates
```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# Railway auto-deploys (if auto-deploy enabled)
# Or manually trigger in Railway dashboard
```

### For Frontend Updates
```bash
# Make changes locally
git add .
git commit -m "Update frontend"
git push origin main

# Railway auto-deploys
# Or manually trigger in Railway dashboard
```

### Enable Auto-Deploy
1. In Railway service → Settings
2. Toggle "Auto Deploy" ON
3. Automatic deployment on every push to main

---

## 💰 Cost Estimation

### Railway Pricing (as of 2024)
- **Free Tier**: $5/month credit
- **Usage**: Pay-as-you-go after credit
- **Typical Cost**: $10-30/month for small-medium app

### Breakdown
- Backend (Node.js): ~$5-10/month
- Frontend (Static): ~$2-5/month
- PostgreSQL: ~$5-15/month
- **Total**: ~$12-30/month

---

## 🔐 Security Checklist

- [ ] All sensitive keys in environment variables (not in code)
- [ ] HTTPS enabled (automatic with Railway)
- [ ] Database password strong and secure
- [ ] JWT secret is random and long (32+ characters)
- [ ] SMTP password is app-specific (not main password)
- [ ] Paystack keys are LIVE keys (not test)
- [ ] Frontend URL updated in backend
- [ ] Backend URL updated in frontend
- [ ] CORS configured correctly
- [ ] Admin emails configured
- [ ] Database backups enabled (Railway auto-backups)

---

## 📝 Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Login works
- [ ] Booking creation works
- [ ] Payment processes successfully
- [ ] Emails are sent
- [ ] Chat works in real-time
- [ ] Admin panel accessible
- [ ] Wallet functions work
- [ ] Location search works
- [ ] All images load correctly

---

## 🆘 Getting Help

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Common Resources
- Node.js deployment: https://docs.railway.app/guides/nodejs
- PostgreSQL setup: https://docs.railway.app/databases/postgresql
- Environment variables: https://docs.railway.app/develop/variables

---

## 📞 Quick Reference

| Service | URL | Variables |
|---------|-----|-----------|
| Backend | https://your-backend.railway.app | DATABASE_URL, JWT_SECRET, PAYSTACK_*, SMTP_* |
| Frontend | https://your-frontend.railway.app | VITE_API_URL, VITE_SOCKET_URL, VITE_GOOGLE_MAPS_API_KEY |
| Database | PostgreSQL | DATABASE_URL |

---

## ✅ Deployment Complete!

Once all steps are complete, your Hustlaa platform is live and accessible to users worldwide!

**Next Steps:**
1. Share frontend URL with beta users
2. Monitor logs for errors
3. Gather user feedback
4. Iterate and improve
5. Plan marketing launch

---

**Status**: ✅ Ready for Production Deployment
**Last Updated**: December 12, 2024
**Version**: 1.0.0
