# Configure Vercel Environment Variables - Step by Step

## Your Vercel Project URLs

- **Backend**: https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app
- **Frontend**: (will be generated after deployment)

---

## Step 1: Configure Backend Environment Variables

1. Go to: https://vercel.com/etnit-systems-lab/hustlaa/settings/environment-variables
2. Click "Add New" for each variable below
3. Select "Production" for each
4. Click "Save"

### Variables to Add:

| Name | Value |
|------|-------|
| DATABASE_URL | postgresql://postgres:zZWZLFllrGjddZAMgBdQZsJATwJJCdeN@postgres.railway.internal:5432/railway |
| JWT_SECRET | hustlaa_jwt_secret_key_2024_production_secure_key_minimum_32_chars |
| NODE_ENV | production |
| FRONTEND_URL | https://hustlaa-frontend.vercel.app |
| PAYSTACK_SECRET_KEY | sk_test_placeholder |
| PAYSTACK_PUBLIC_KEY | pk_test_placeholder |
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 587 |
| SMTP_USER | your_email@gmail.com |
| SMTP_PASS | your_app_password |
| SMTP_FROM | Hustlaa <no-reply@hustlaa.com> |
| ADMIN_EMAILS | admin@hustlaa.com |

---

## Step 2: Deploy Frontend

1. Go to: https://vercel.com/etnit-systems-lab/hustlaa
2. Click on "frontend" folder/project
3. If not deployed yet, click "Deploy"
4. Wait for deployment to complete

---

## Step 3: Configure Frontend Environment Variables

1. Go to: https://vercel.com/etnit-systems-lab/hustlaa/settings/environment-variables
2. Add these variables:

| Name | Value |
|------|-------|
| VITE_API_URL | https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app/api |
| VITE_SOCKET_URL | https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app |
| VITE_GOOGLE_MAPS_API_KEY | your_google_maps_api_key_here |

---

## Step 4: Test

1. Visit: https://hustlaa-frontend.vercel.app (or your frontend URL)
2. Go to /login
3. Try logging in
4. Should work!

---

## Important

- Replace `your_email@gmail.com` with your actual Gmail
- Replace `your_app_password` with Gmail app password
- After adding variables, services auto-redeploy
