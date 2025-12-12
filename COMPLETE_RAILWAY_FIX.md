# Complete Railway Configuration Fix

## Problem Summary
- Backend returning 404 errors
- Frontend CORS preflight failing
- Environment variables not properly configured

## Root Cause
The backend environment variables (especially DATABASE_URL) are incomplete or not properly saved on Railway.

---

## Solution: Complete Backend Configuration

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Log in with your account
3. Go to project: **resourceful-prosperity**

### Step 2: Configure Backend Service

1. Click on **hustlaa-backend** service
2. Click **Variables** tab
3. **DELETE all existing variables** (except Railway system variables)
4. Click **Raw Editor**
5. **Paste ALL these variables** (copy the entire block):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:zZWZLFllrGjddZAMgBdQZsJATwJJCdeN@postgres.railway.internal:5432/railway
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

6. Click **Save**
7. **Wait for redeploy** (watch for green checkmark - 3-5 minutes)

### Step 3: Configure Frontend Service

1. Click on **hustlaa-frontend** service
2. Click **Variables** tab
3. Click **Raw Editor**
4. **Paste these variables**:

```
VITE_API_URL=https://hustlaa-backend-production.up.railway.app/api
VITE_SOCKET_URL=https://hustlaa-backend-production.up.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

5. Click **Save**
6. **Wait for redeploy** (green checkmark)

### Step 4: Verify Both Services

After both services have green checkmarks:

1. **Test Backend Health**: 
   - Open: https://hustlaa-backend-production.up.railway.app/api/health
   - Should show: `{"status":"OK"}`

2. **Test Frontend**:
   - Open: https://hustlaa-frontend-production.up.railway.app
   - Should load homepage

3. **Test Login**:
   - Go to: https://hustlaa-frontend-production.up.railway.app/login
   - Try logging in
   - Should work without CORS errors

---

## Important Notes

### Database URL Format
- **Private endpoint** (no egress fees): `postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway`
- **Public endpoint** (has egress fees): `postgresql://postgres:PASSWORD@maglev.proxy.rlwy.net:PORT/railway`

Use the **private endpoint** to avoid charges.

### SMTP Configuration
- Replace `your_email@gmail.com` with your actual Gmail
- Replace `your_app_password` with your Gmail app password
- [Get Gmail app password here](https://myaccount.google.com/apppasswords)

### Paystack Keys
- Currently using test keys (`sk_test_placeholder`, `pk_test_placeholder`)
- Update to live keys when ready for production

---

## Troubleshooting

### Still Getting 404 Errors
1. Clear browser cache: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Hard refresh: `Ctrl+F5` (or `Cmd+Shift+R` on Mac)
3. Check backend logs in Railway dashboard
4. Verify all variables are saved (no truncation)

### Still Getting CORS Errors
1. Verify `VITE_API_URL` is set correctly in frontend
2. Verify `FRONTEND_URL` is set correctly in backend
3. Check that both services have redeployed (green checkmarks)
4. Clear browser cache and hard refresh

### Database Connection Errors
1. Verify `DATABASE_URL` uses `postgres.railway.internal` (private endpoint)
2. Verify password is correct: `zZWZLFllrGjddZAMgBdQZsJATwJJCdeN`
3. Verify database name is `railway`
4. Check backend logs for connection errors

---

## Verification Checklist

- [ ] Backend service has all 13 variables configured
- [ ] Frontend service has 3 variables configured
- [ ] Both services show green checkmarks (deployed)
- [ ] Backend health check returns `{"status":"OK"}`
- [ ] Frontend homepage loads without errors
- [ ] Login page loads without CORS errors
- [ ] Can successfully log in or register
- [ ] No 404 or 405 errors in browser console

---

## Next Steps After Fix

1. Test all features (login, register, booking, payment, etc.)
2. Monitor logs for any errors
3. Update Paystack keys to live keys when ready
4. Configure custom domain (optional)
5. Launch to beta users

---

**Status**: Configuration guide ready - follow steps above to fix all issues
