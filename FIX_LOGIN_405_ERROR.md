# Fix Login 405 Error - Configure Frontend API URL

## Problem
Login and registration are returning 405 errors because the frontend doesn't know where the backend API is located.

The frontend is trying to use a relative `/api` path, but the backend is on a different domain.

## Solution: Configure Frontend Environment Variables

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Log in
3. Go to project "resourceful-prosperity"

### Step 2: Select Frontend Service
1. Click on "hustlaa-frontend" service
2. You should see the service details

### Step 3: Go to Variables Tab
1. Click the "Variables" tab
2. Look for "Raw Editor" button

### Step 4: Add Frontend Variables
Copy and paste these variables into the Raw Editor:

```
VITE_API_URL=https://hustlaa-backend-production.up.railway.app/api
VITE_SOCKET_URL=https://hustlaa-backend-production.up.railway.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Step 5: Save and Redeploy
1. Click "Save"
2. Frontend will automatically redeploy
3. Wait for green checkmark (2-3 minutes)

### Step 6: Test Login
1. Go to https://hustlaa-frontend-production.up.railway.app/login
2. Try logging in
3. Should work now!

---

## Also Verify Backend Variables

Make sure your backend has these critical variables set:

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

---

## Expected Result
After configuring both frontend and backend variables:
- ✅ Login will work
- ✅ Registration will work
- ✅ All API calls will succeed
- ✅ No more 405 errors

---

## Troubleshooting

If you still get 405 errors after configuring variables:

1. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard refresh**: Ctrl+F5 (or Cmd+Shift+R on Mac)
3. **Check backend is running**: Visit https://hustlaa-backend-production.up.railway.app/api/health
   - Should return: `{"status":"OK"}`
4. **Check frontend logs**: Go to hustlaa-frontend → Logs tab
5. **Check backend logs**: Go to hustlaa-backend → Logs tab

---

## Quick Checklist

- [ ] Frontend VITE_API_URL configured
- [ ] Frontend VITE_SOCKET_URL configured
- [ ] Backend DATABASE_URL using private endpoint (postgres.railway.internal)
- [ ] Backend JWT_SECRET configured
- [ ] Backend FRONTEND_URL configured
- [ ] Both services redeployed (green checkmarks)
- [ ] Browser cache cleared
- [ ] Can access https://hustlaa-backend-production.up.railway.app/api/health
- [ ] Login page loads without errors
- [ ] Can successfully log in
