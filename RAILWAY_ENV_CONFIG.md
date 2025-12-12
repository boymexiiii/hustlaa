# Railway Environment Variables Configuration

## Your Service URLs

- **Backend**: https://hustlaa-backend-production.up.railway.app
- **Frontend**: https://hustlaa-frontend-production.up.railway.app
- **Database**: PostgreSQL connected

---

## Backend Service Environment Variables

Go to Railway Dashboard → hustlaa-backend → Variables tab → Add these:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:zZWZLFllrGjddZAMgBdQZsJATwJJCdeN@maglev.proxy.rlwy.net:36683/railway
JWT_SECRET=hustlaa_jwt_secret_key_2024_production_secure_key_minimum_32_chars
FRONTEND_URL=https://hustlaa-frontend-production.up.railway.app
PAYSTACK_SECRET_KEY=sk_test_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_placeholder
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=Hustlaa <no-reply@hustlaa.com>
ADMIN_EMAILS=admin@hustlaa.com
```

---

## Frontend Service Environment Variables

Go to Railway Dashboard → hustlaa-frontend → Variables tab → Add these:

```
VITE_API_URL=https://hustlaa-backend-production.up.railway.app/api
VITE_SOCKET_URL=https://hustlaa-backend-production.up.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## Steps to Configure

1. **Open Railway Dashboard**: https://railway.app
2. **Go to Project**: resourceful-prosperity
3. **Select Backend Service**: hustlaa-backend
4. **Click Variables Tab**
5. **Click "Raw Editor"** (easier for pasting multiple variables)
6. **Paste all backend variables** from above
7. **Save**
8. **Repeat for Frontend Service** with frontend variables

---

## After Configuration

Once you've added all variables:
1. Both services will automatically redeploy
2. Wait for green checkmarks
3. Test the URLs:
   - Backend: https://hustlaa-backend-production.up.railway.app/api/health
   - Frontend: https://hustlaa-frontend-production.up.railway.app

---

## Important Notes

- Replace `your_email@gmail.com` with your actual Gmail
- Replace `your_app_password` with Gmail app password
- Replace `your_google_maps_api_key_here` with your actual Google Maps API key (optional)
- Keep `sk_test_placeholder` and `pk_test_placeholder` for now (update with live keys when ready)
