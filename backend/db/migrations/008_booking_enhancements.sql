-- Add columns to bookings table for enhanced features
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(50); -- 'weekly', 'biweekly', 'monthly'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_arrival_time TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- Create booking_completion_photos table
CREATE TABLE IF NOT EXISTS booking_completion_photos (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  photo_url VARCHAR(255) NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_completion_photos_booking_id ON booking_completion_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_completion_photos_uploaded_by ON booking_completion_photos(uploaded_by);

-- Create booking_timeline table for tracking booking progress
CREATE TABLE IF NOT EXISTS booking_timeline (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'created', 'confirmed', 'started', 'paused', 'resumed', 'completed', 'cancelled'
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_timeline_booking_id ON booking_timeline(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_timeline_event_type ON booking_timeline(event_type);
