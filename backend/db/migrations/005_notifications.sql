-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'booking', 'payment', 'review', 'message', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reference_id INTEGER, -- booking_id, payment_id, etc.
  reference_type VARCHAR(50), -- 'booking', 'payment', 'review', etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_bookings BOOLEAN DEFAULT TRUE,
  email_payments BOOLEAN DEFAULT TRUE,
  email_reviews BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  push_bookings BOOLEAN DEFAULT TRUE,
  push_payments BOOLEAN DEFAULT TRUE,
  push_reviews BOOLEAN DEFAULT TRUE,
  push_messages BOOLEAN DEFAULT TRUE,
  in_app_bookings BOOLEAN DEFAULT TRUE,
  in_app_payments BOOLEAN DEFAULT TRUE,
  in_app_reviews BOOLEAN DEFAULT TRUE,
  in_app_messages BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create push subscriptions table for web push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  auth_key VARCHAR(100) NOT NULL,
  p256dh_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);
