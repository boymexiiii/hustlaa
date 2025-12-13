# Deploy Both Frontend and Backend to Render

## Option 1: Using Render Dashboard (Recommended)

### Step 1: Deploy Backend First

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Choose: `boymexiiii/hustlaa`
5. Configure:
   - **Name:** `hustlaa-backend`
   - **Environment:** `Node`
   - **Region:** `Oregon` (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

6. Click **"Advanced"** and add environment variables:
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

7. Click **"Create Web Service"** and wait for deployment
8. Once deployed, note the URL (e.g., `https://hustlaa-backend.onrender.com`)

### Step 2: Initialize Backend Database

1. In Render dashboard, go to your `hustlaa-backend` service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run db:migrate && npm run db:seed
   ```

### Step 3: Deploy Frontend

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Static Site"**
3. Select **"Deploy an existing repository"**
4. Choose: `boymexiiii/hustlaa`
5. Configure:
   - **Name:** `hustlaa-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

6. Click **"Advanced"** and add environment variable:
   ```
   VITE_API_URL=https://hustlaa-backend.onrender.com/api
   ```
   (Replace with your actual backend URL from Step 1)

7. Click **"Create Static Site"** and wait for deployment
8. You'll get a URL like: `https://hustlaa-frontend.onrender.com`

### Step 4: Verify Deployment

Test both services:

**Backend health check:**
```bash
curl https://hustlaa-backend.onrender.com/api/health
```

**Frontend:** Visit `https://hustlaa-frontend.onrender.com` in your browser

---

## Option 2: Using Render Blueprint (Advanced)

If you want to deploy both with one click:

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Select your repository: `boymexiiii/hustlaa`
4. The `render.yaml` file will be detected automatically
5. Configure environment variables when prompted
6. Click **"Deploy"**

---

## Environment Variables Reference

### Backend Variables
| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Neon connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | `production` | Yes |
| `PORT` | `10000` | No (default) |
| `PAYSTACK_SECRET_KEY` | Your Paystack key | No |
| `PAYSTACK_PUBLIC_KEY` | Your Paystack key | No |
| `ADMIN_EMAILS` | Admin email addresses | No |
| `SMTP_HOST` | Email server host | No |
| `SMTP_PORT` | Email server port | No |
| `SMTP_USER` | Email username | No |
| `SMTP_PASS` | Email password | No |

### Frontend Variables
| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

---

## Troubleshooting

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` is correct
- Check backend is running (visit health endpoint)
- Check browser console for CORS errors

### Database Connection Failed
- Verify `DATABASE_URL` is correct
- Check Neon connection limits
- Ensure SSL is enabled

### Build Fails
- Check build logs in Render dashboard
- Verify root directory is correct
- Ensure all dependencies are in package.json

### Service Won't Start
- Check Node.js version (18+ required)
- Review environment variables
- Check server.js for syntax errors

---

## Monitoring & Maintenance

1. **Logs:** Check Render dashboard logs regularly
2. **Uptime:** Monitor service health
3. **Database:** Monitor Neon connection usage
4. **Performance:** Test API response times

---

## Cost Considerations

**Render Free Tier:**
- 750 hours/month compute per service
- Auto-spins down after 15 min inactivity
- Good for development/testing

**For Production:**
- Consider paid plan for always-on services
- Monitor usage and upgrade if needed

---

## Next Steps After Deployment

1. Test user registration and login
2. Test artisan job applications
3. Test customer job creation
4. Verify all API endpoints work
5. Set up monitoring and alerts
