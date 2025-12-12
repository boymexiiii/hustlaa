-- Create portfolio_items table for artisan gallery
CREATE TABLE IF NOT EXISTS portfolio_items (
  id SERIAL PRIMARY KEY,
  artisan_id INTEGER NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'before_after', 'project', 'certificate'
  before_image_url VARCHAR(255), -- For before/after comparisons
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_artisan_id (artisan_id),
  INDEX idx_category (category)
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  artisan_id INTEGER NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url VARCHAR(255),
  certificate_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_artisan_id (artisan_id),
  INDEX idx_expiry_date (expiry_date)
);

-- Create portfolio_views table to track portfolio engagement
CREATE TABLE IF NOT EXISTS portfolio_views (
  id SERIAL PRIMARY KEY,
  portfolio_item_id INTEGER NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_portfolio_item_id (portfolio_item_id),
  INDEX idx_user_id (user_id)
);
