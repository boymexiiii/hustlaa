# Configure Environment Variables on Vercel

## Backend Service Environment Variables

Go to: https://vercel.com/etnit-systems-lab/hustlaa/settings/environment-variables

Add these environment variables:

```
DATABASE_URL=postgresql://postgres:zZWZLFllrGjddZAMgBdQZsJATwJJCdeN@postgres.railway.internal:5432/railway
JWT_SECRET=hustlaa_jwt_secret_key_2024_production_secure_key_minimum_32_chars
NODE_ENV=production
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

For each variable:
1. Click "Add New"
2. Enter the name (e.g., DATABASE_URL)
3. Enter the value
4. Select "Production" environment
5. Click "Save"

After adding all variables, the deployment will automatically restart.

---

## Frontend Service Environment Variables

Go to: https://vercel.com/etnit-systems-lab/hustlaa/settings/environment-variables

Add these environment variables:

```
VITE_API_URL=https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app/api
VITE_SOCKET_URL=https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

## Important Notes

- Replace `your_email@gmail.com` with your actual Gmail
- Replace `your_app_password` with your Gmail app password
- The backend URL is: `https://hustlaa-koyxhbtos-etnit-systems-lab.vercel.app`
- After adding variables, services will automatically redeploy

---

## Test After Configuration

1. Visit: https://hustlaa-frontend.vercel.app
2. Go to login page
3. Try logging in or registering
4. Should work without errors!
