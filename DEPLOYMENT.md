# Hustlaa Application Deployment Guide

## Frontend Deployment ✅ COMPLETE

**Live URL:** https://chimerical-scone-7cfdf3.netlify.app

**Deployment Details:**
- Platform: Netlify
- Framework: Vite (React)
- Build Command: `npm run build`
- Publish Directory: `dist`
- Environment Variables:
  - `VITE_API_URL`: https://hustlaa-backend.onrender.com/api (configured)

**Status:** Production deployment is live and accessible

---

## Backend Deployment - PENDING

The backend is currently running locally with Neon Postgres. To deploy to production, choose one of these options:

### Option 1: Render.com (Recommended - Free Tier Available)

1. Go to https://render.com and sign up
2. Create a new Web Service
3. Connect your GitHub repository (fork the project if needed)
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     NODE_ENV=production
     DATABASE_URL=postgresql://neondb_owner:npg_r8A1CNQhkazw@ep-wandering-hill-a4kgkena-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     JWT_SECRET=hustlaa_secret_key_change_in_production_2024
     PORT=10000
     PAYSTACK_SECRET_KEY=<your-key>
     ADMIN_EMAILS=admin@hustlaa.com
     SMTP_HOST=<your-smtp>
     SMTP_PORT=587
     SMTP_USER=<your-email>
     SMTP_PASSWORD=<your-password>
     ```
5. Deploy and update `VITE_API_URL` in frontend to the Render URL

### Option 2: Vercel

1. Go to https://vercel.com and sign up
2. Import your project
3. Configure environment variables (same as above)
4. Deploy

### Option 3: Railway.app

1. Go to https://railway.app and sign up
2. Create new project
3. Add PostgreSQL (or use Neon)
4. Deploy with environment variables

---

## Database Status ✅

**Database:** Neon Postgres
**Connection String:** Configured in `backend/.env`
**Schema:** Deployed and initialized
**Seed Data:** Populated

---

## Current Local Setup

**Frontend:**
- Port: 3000
- Command: `npm run dev`
- Status: Ready to deploy

**Backend:**
- Port: 5002
- Command: `npm start`
- Status: Running locally, ready for production deployment

---

## Next Steps

1. Choose a backend hosting platform (Render.com recommended)
2. Push code to GitHub (if not already done)
3. Connect repository to chosen platform
4. Configure environment variables
5. Deploy backend
6. Update frontend `VITE_API_URL` with production backend URL
7. Test end-to-end functionality

---

## Environment Variables Checklist

### Backend (.env)
- [x] DATABASE_URL (Neon)
- [x] JWT_SECRET
- [x] PORT
- [ ] PAYSTACK_SECRET_KEY (if using payments)
- [ ] ADMIN_EMAILS
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (if using email)

### Frontend (Netlify)
- [x] VITE_API_URL

---

## Testing the Deployment

Once backend is deployed:

1. Visit frontend: https://chimerical-scone-7cfdf3.netlify.app
2. Test user registration and login
3. Test artisan job applications
4. Test customer job creation
5. Verify API calls reach the backend

---

## Troubleshooting

**Frontend can't reach backend:**
- Check `VITE_API_URL` environment variable
- Verify backend is running and accessible
- Check CORS configuration in backend

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check Neon connection limits
- Ensure SSL is enabled in connection string

**Build failures:**
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for missing environment variables
