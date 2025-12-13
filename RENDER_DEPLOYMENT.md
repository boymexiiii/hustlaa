# Render.com Backend Deployment Guide

## Prerequisites
- Render.com account (https://render.com)
- GitHub repository with code pushed (✅ Already done)
- Neon Postgres database (✅ Already configured)

## Step-by-Step Deployment

### 1. Create a New Web Service on Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Choose repository: `boymexiiii/hustlaa`
5. Click **"Connect"**

### 2. Configure the Web Service

**Basic Settings:**
- **Name:** `hustlaa-backend`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`

**Build & Deploy:**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Add Environment Variables

Click **"Advanced"** and add these environment variables:

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
```

**Important:** Replace placeholder values with your actual credentials.

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (usually 2-5 minutes)
4. You'll get a URL like: `https://hustlaa-backend.onrender.com`

### 5. Initialize Database (One-time)

After deployment, run database migrations:

```bash
# Via Render Shell
npm run db:migrate
npm run db:seed
```

Or use the Render dashboard:
1. Go to your service
2. Click **"Shell"** tab
3. Run: `npm run db:migrate && npm run db:seed`

## Update Frontend with Backend URL

Once you have the Render URL:

1. Go to Netlify dashboard
2. Select `chimerical-scone-7cfdf3` project
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Update `VITE_API_URL` to your Render URL:
   ```
   https://hustlaa-backend.onrender.com/api
   ```
5. Trigger a new deploy

## Verify Deployment

Test the backend is working:

```bash
curl https://hustlaa-backend.onrender.com/api/health
```

Expected response:
```json
{"status":"OK"}
```

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `backend` is set as root directory
- Verify all dependencies in `package.json`

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check Neon connection limits
- Ensure SSL is enabled in connection string

### Service Won't Start
- Check Node.js version (18+ required)
- Review environment variables
- Check `server.js` for syntax errors

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is set correctly
- Check CORS is enabled in backend
- Ensure backend URL is accessible

## Monitoring

After deployment:
1. Check Render logs regularly
2. Monitor database connections in Neon
3. Test API endpoints from frontend
4. Set up error notifications

## Cost Considerations

**Render Free Tier:**
- 750 hours/month compute
- Suitable for development/testing
- Auto-spins down after 15 min inactivity

**For Production:**
- Consider paid plan for always-on service
- Monitor usage and upgrade if needed

## Next Steps

1. Deploy to Render using steps above
2. Get your Render URL
3. Update frontend `VITE_API_URL`
4. Test end-to-end functionality
5. Monitor logs and performance
