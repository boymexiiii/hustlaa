# Deploy Hustlaa to Vercel

## Quick Setup

### Step 1: Deploy Backend to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `boymexiiii/hustlaa`
4. Configure the project:
   - **Project Name**: hustlaa-backend
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`
   - **Start Command**: `node server.js`

5. Click "Environment Variables" and add:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:zZWZLFllrGjddZAMgBdQZsJATwJJCdeN@postgres.railway.internal:5432/railway
JWT_SECRET=hustlaa_jwt_secret_key_2024_production_secure_key_minimum_32_chars
FRONTEND_URL=https://hustlaa-frontend.vercel.app
PAYSTACK_SECRET_KEY=sk_test_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_placeholder
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Hustlaa <no-reply@hustlaa.com>
ADMIN_EMAILS=admin@hustlaa.com
```

6. Click "Deploy"

---

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `boymexiiii/hustlaa`
4. Configure the project:
   - **Project Name**: hustlaa-frontend
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click "Environment Variables" and add:
```
VITE_API_URL=https://hustlaa-backend.vercel.app/api
VITE_SOCKET_URL=https://hustlaa-backend.vercel.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

6. Click "Deploy"

---

## Expected URLs After Deployment

- **Backend API**: https://hustlaa-backend.vercel.app/api
- **Frontend**: https://hustlaa-frontend.vercel.app

---

## Test Deployment

1. Visit: https://hustlaa-frontend.vercel.app
2. Go to login page
3. Try logging in or registering
4. Should work without errors!

---

## Important Notes

- Vercel automatically redeploys when you push to GitHub
- Environment variables can be updated in Vercel dashboard anytime
- Backend uses Vercel's serverless functions (Node.js runtime)
- Frontend is a static site with Vite

---

## Troubleshooting

If you get errors:
1. Check Vercel deployment logs in dashboard
2. Verify environment variables are set correctly
3. Make sure database URL is correct
4. Check that GitHub repository is connected

---

## Next Steps

After successful deployment:
1. Update your domain settings (optional)
2. Configure custom domain (optional)
3. Monitor logs for any issues
4. Update Paystack keys to live keys when ready
