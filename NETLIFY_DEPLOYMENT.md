# Deploy Frontend and Backend to Netlify

## Overview

Netlify supports both static frontend sites and Node.js backends through serverless functions. This guide shows how to deploy both your Hustlaa frontend and backend to Netlify.

## Option 1: Deploy Both to Same Netlify Site (Recommended)

### Step 1: Update Netlify Configuration

The root `netlify.toml` is already configured to:
- Build frontend from `frontend/` directory
- Build backend from `backend/` directory
- Route `/api/*` requests to serverless functions
- Serve frontend as static site

### Step 2: Deploy to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your GitHub repository: `boymexiiii/hustlaa`
4. Configure build settings:
   - **Base directory:** (leave empty - monorepo root)
   - **Build command:** `npm install --prefix frontend && npm install --prefix backend`
   - **Publish directory:** `frontend/dist`

5. Click **"Advanced"** and add environment variables:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_r8A1CNQhkazw@ep-wandering-hill-a4kgkena-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=hustlaa_secret_key_change_in_production_2024
   NODE_ENV=production
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ADMIN_EMAILS=admin@hustlaa.com
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   SMTP_FROM=no-reply@hustlaa.com
   VITE_API_URL=/api
   ```

6. Click **"Deploy site"**

### Step 3: Initialize Database (One-time)

After deployment, initialize the database:

1. Go to your Netlify site
2. Click **"Functions"** tab
3. Use the Netlify CLI to run migrations:
   ```bash
   netlify functions:invoke api --payload '{"method":"POST","path":"/db/migrate"}'
   ```

Or manually via SSH/terminal if available.

---

## Option 2: Deploy Frontend and Backend Separately

### Deploy Frontend Only

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select your repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.netlify.app/api
   ```
6. Deploy

### Deploy Backend Only

For backend-only deployment on Netlify:

1. Create a new site from your repository
2. Configure:
   - **Base directory:** `backend`
   - **Build command:** `npm install`
   - **Functions directory:** `api`
3. Add all backend environment variables
4. Deploy

---

## Environment Variables

### Required for Backend
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Secret key for JWT |
| `NODE_ENV` | `production` |

### Optional for Backend
| Variable | Value |
|----------|-------|
| `PAYSTACK_SECRET_KEY` | Paystack API key |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `ADMIN_EMAILS` | Admin email addresses |
| `SMTP_HOST` | Email server host |
| `SMTP_PORT` | Email server port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |

### Required for Frontend
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Backend API URL (e.g., `/api` or `https://backend.netlify.app/api`) |

---

## Netlify Functions Limitations

**Important:** Netlify serverless functions have limitations:
- **Cold start time:** 1-5 seconds
- **Execution time:** Max 26 seconds
- **Memory:** 512MB default
- **No persistent connections:** Socket.io won't work
- **File uploads:** Limited to 6MB

For production with heavy usage, consider:
- Render.com (better for Node.js backends)
- Railway.app
- Heroku
- AWS Lambda

---

## Testing After Deployment

1. **Frontend:** Visit your Netlify URL
2. **Backend health:** `https://your-site.netlify.app/api/health`
3. **Test API calls:** Try login, register, job creation

---

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are installed
- Check for syntax errors

### Functions Not Working
- Verify `netlify/functions/api.js` exists
- Check function logs in Netlify dashboard
- Ensure environment variables are set

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check Neon connection limits
- Ensure SSL is enabled

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is correct
- Check CORS configuration
- Test health endpoint directly

---

## Advantages of Netlify

✅ Easy deployment from GitHub
✅ Automatic HTTPS
✅ CDN for frontend
✅ Free tier available
✅ Integrated analytics
✅ Preview deployments

## Disadvantages for Backend

❌ Cold start delays
❌ Limited execution time
❌ No persistent connections
❌ Limited memory
❌ Expensive for high traffic

---

## Recommendation

For best results:
- **Frontend:** Deploy to Netlify (excellent for static sites)
- **Backend:** Deploy to Render or Railway (better for Node.js)

Or use Netlify for both if you don't need real-time features (Socket.io).
