# Quick Fix: Registration Error - Configure Environment Variables

## Problem
Registration is failing because the backend service doesn't have environment variables configured, particularly `DATABASE_URL` and `JWT_SECRET`.

## Solution: Add Variables to Railway Backend Service

### Step 1: Go to Railway Dashboard
1. Open https://railway.app in your browser
2. Log in with your account
3. Click on project "resourceful-prosperity"

### Step 2: Select Backend Service
1. Click on "hustlaa-backend" service
2. You should see the service details page

### Step 3: Go to Variables Tab
1. Click the "Variables" tab at the top
2. You'll see existing Railway system variables
3. Look for a button that says "Raw Editor" or "Add Variable"

### Step 4: Add All Backend Variables
Copy and paste ALL of these variables into the Raw Editor:

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

### Step 5: Save
1. Click "Save" or "Deploy" button
2. Railway will automatically redeploy the backend service
3. Wait for the green checkmark (deployment complete)

### Step 6: Test Registration
1. Go to https://hustlaa-frontend-production.up.railway.app
2. Click "Register"
3. Fill in the form and submit
4. Registration should now work!

---

## If Still Getting Errors

Check the backend logs:
1. Go to hustlaa-backend service
2. Click "Logs" tab
3. Look for error messages
4. Share the error message for debugging

---

## Important Notes
- **SMTP_USER** and **SMTP_PASS**: Update with your actual Gmail credentials
- **VITE_GOOGLE_MAPS_API_KEY**: Optional, only needed if you want map features
- **Paystack Keys**: Currently using test keys - update to live keys when ready for production

---

## Expected Result
After adding these variables and redeploying:
- ✅ Registration will work
- ✅ Login will work
- ✅ Database connections will work
- ✅ All features will be functional
