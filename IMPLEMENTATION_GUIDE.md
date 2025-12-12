# Hustlaa - Payment, Upload & Admin Implementation Guide

## ✅ What Has Been Implemented

### 1. Paystack Payment Integration

**Backend (`/backend/routes/payments.js`):**
- ✅ Initialize payment endpoint with Paystack API
- ✅ Payment verification endpoint
- ✅ Automatic booking confirmation after payment
- ✅ Transaction metadata tracking

**Features:**
- Converts amounts to kobo (Paystack requirement)
- Stores customer details in payment metadata
- Returns authorization URL for payment
- Verifies payment status with Paystack
- Updates booking status to 'confirmed' after successful payment

**Environment Variables Required:**
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### 2. Image Upload System

**Backend (`/backend/routes/upload.js`):**
- ✅ Profile picture upload
- ✅ Service image upload
- ✅ Verification document upload
- ✅ File validation (image types only)
- ✅ 5MB file size limit
- ✅ Unique filename generation with UUID
- ✅ Static file serving

**Features:**
- Multer for file handling
- Automatic uploads directory creation
- Security: Directory traversal prevention
- Supported formats: JPEG, PNG, GIF, WebP

**Frontend API (`/frontend/src/services/api.js`):**
- ✅ `uploadAPI.uploadProfilePicture(file)`
- ✅ `uploadAPI.uploadServiceImage(serviceId, file)`
- ✅ `uploadAPI.uploadVerificationDocument(file)`

### 3. Admin Panel

**Backend (`/backend/routes/admin.js`):**
- ✅ Dashboard statistics
- ✅ User management with pagination
- ✅ Pending artisan verifications
- ✅ Verify/Reject artisan endpoint
- ✅ Bookings management
- ✅ Platform analytics
- ✅ Admin middleware (email-based authentication)

**Frontend (`/frontend/src/pages/Admin.jsx`):**
- ✅ Dashboard with key metrics
- ✅ Pending verifications list
- ✅ One-click verify/reject actions
- ✅ Real-time stats display
- ✅ Responsive design

**Admin Access:**
Set admin emails in `.env`:
```env
ADMIN_EMAILS=admin@hustlaa.com,admin2@hustlaa.com
```

## 🚀 How to Use

### Setting Up Paystack

1. **Get Paystack API Keys:**
   - Sign up at https://paystack.com
   - Go to Settings > API Keys & Webhooks
   - Copy your Test Secret Key and Public Key

2. **Update `.env` file:**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
   ```

3. **Frontend Integration:**
   ```javascript
   // In BookingDetails or Payment component
   import { paymentsAPI } from '../services/api';

   const handlePayment = async (bookingId) => {
     try {
       const response = await paymentsAPI.initialize({ booking_id: bookingId });
       // Redirect to Paystack payment page
       window.location.href = response.data.authorization_url;
     } catch (error) {
       toast.error('Payment initialization failed');
     }
   };
   ```

4. **Payment Verification:**
   ```javascript
   // After payment redirect (callback URL)
   const verifyPayment = async (reference) => {
     try {
       const response = await paymentsAPI.verify(reference);
       if (response.data.success) {
         toast.success('Payment successful!');
         navigate('/bookings');
       }
     } catch (error) {
       toast.error('Payment verification failed');
     }
   };
   ```

### Using Image Upload

1. **Profile Picture Upload:**
   ```javascript
   import { uploadAPI } from '../services/api';

   const handleImageUpload = async (event) => {
     const file = event.target.files[0];
     if (!file) return;

     try {
       const response = await uploadAPI.uploadProfilePicture(file);
       toast.success('Profile picture updated!');
       // Update user state with new image URL
       setUser({ ...user, profile_image_url: response.data.image_url });
     } catch (error) {
       toast.error('Upload failed');
     }
   };

   // In JSX
   <input 
     type="file" 
     accept="image/*" 
     onChange={handleImageUpload}
   />
   ```

2. **Service Image Upload:**
   ```javascript
   const handleServiceImage = async (serviceId, file) => {
     try {
       const response = await uploadAPI.uploadServiceImage(serviceId, file);
       toast.success('Service image uploaded!');
     } catch (error) {
       toast.error('Upload failed');
     }
   };
   ```

### Accessing Admin Panel

1. **Set Admin Email:**
   Update `backend/.env`:
   ```env
   ADMIN_EMAILS=your-email@example.com
   ```

2. **Register/Login with Admin Email:**
   - Register a new account using the admin email
   - Login normally
   - Navigate to `/admin`

3. **Admin Features:**
   - View platform statistics
   - Verify pending artisans
   - Manage users and bookings
   - View analytics

## 📦 Installation

Install new dependencies:

```bash
# Backend
cd backend
npm install

# The following packages are now included:
# - paystack (for payment integration)
# - sharp (for image processing)
# - uuid (for unique filenames)
```

## 🔧 Server Configuration

The server has been updated to:
- Serve uploaded files from `/uploads` directory
- Include upload and admin routes
- Support multipart/form-data for file uploads

## 📝 Database Schema Updates Needed

Add these columns if not present:

```sql
-- Add image URL to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Ensure profile_image_url exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);
```

## 🎨 Frontend Components to Create

### 1. Payment Button Component
```javascript
// components/PaymentButton.jsx
import React from 'react';
import { CreditCard } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PaymentButton = ({ bookingId, amount }) => {
  const handlePayment = async () => {
    try {
      const response = await paymentsAPI.initialize({ booking_id: bookingId });
      window.location.href = response.data.authorization_url;
    } catch (error) {
      toast.error('Payment initialization failed');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
    >
      <CreditCard className="w-5 h-5" />
      Pay ₦{amount}
    </button>
  );
};

export default PaymentButton;
```

### 2. Image Upload Component
```javascript
// components/ImageUpload.jsx
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const ImageUpload = ({ onUploadSuccess, type = 'profile' }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadProfilePicture(file);
      toast.success('Image uploaded successfully!');
      onUploadSuccess(response.data.image_url);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="image-upload"
        disabled={uploading}
      />
      <label
        htmlFor="image-upload"
        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-700"
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'Uploading...' : 'Upload Image'}
      </label>
    </div>
  );
};

export default ImageUpload;
```

## 🔐 Security Considerations

1. **File Upload Security:**
   - ✅ File type validation
   - ✅ File size limits (5MB)
   - ✅ Unique filenames (prevents overwrites)
   - ✅ Directory traversal prevention
   - ⚠️ TODO: Add virus scanning for production
   - ⚠️ TODO: Use cloud storage (AWS S3/Cloudinary) for production

2. **Payment Security:**
   - ✅ Server-side payment initialization
   - ✅ Payment verification before booking confirmation
   - ✅ Secure API key storage in .env
   - ⚠️ TODO: Add webhook for payment notifications
   - ⚠️ TODO: Implement payment retry logic

3. **Admin Security:**
   - ✅ Email-based admin authentication
   - ⚠️ TODO: Add role-based access control (RBAC)
   - ⚠️ TODO: Add audit logging for admin actions
   - ⚠️ TODO: Add two-factor authentication for admins

## 📊 Testing Checklist

### Payment Integration
- [ ] Initialize payment with valid booking
- [ ] Verify payment with valid reference
- [ ] Handle payment failure gracefully
- [ ] Test with Paystack test cards
- [ ] Verify booking status updates after payment

### Image Upload
- [ ] Upload profile picture
- [ ] Upload service image
- [ ] Test file size limit (>5MB should fail)
- [ ] Test invalid file types (should fail)
- [ ] Verify images are accessible via URL

### Admin Panel
- [ ] Access admin panel with admin email
- [ ] View dashboard statistics
- [ ] Verify pending artisan
- [ ] Reject pending artisan
- [ ] Access denied for non-admin users

## 🚀 Production Deployment

### Before Going Live:

1. **Payment Setup:**
   - Switch to Paystack Live keys
   - Set up webhook URL for payment notifications
   - Test with real transactions (small amounts)

2. **File Storage:**
   - Migrate to AWS S3 or Cloudinary
   - Set up CDN for faster image delivery
   - Implement image optimization

3. **Admin Panel:**
   - Create dedicated admin accounts
   - Set up proper role management
   - Add audit logging

4. **Security:**
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
   - Set up monitoring and alerts

## 📞 Support

For Paystack integration issues:
- Docs: https://paystack.com/docs
- Support: support@paystack.com

For platform issues:
- Check logs in `backend/` directory
- Review error messages in browser console
- Contact development team

---

**Status**: ✅ Payment, Upload, and Admin features are fully implemented and ready for testing!
