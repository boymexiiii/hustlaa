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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_artisan_id ON portfolio_items(artisan_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certifications_artisan_id ON certifications(artisan_id);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry_date ON certifications(expiry_date);

-- Create portfolio_views table to track portfolio engagement
CREATE TABLE IF NOT EXISTS portfolio_views (
  id SERIAL PRIMARY KEY,
  portfolio_item_id INTEGER NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolio_views_portfolio_item_id ON portfolio_views(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_user_id ON portfolio_views(user_id);
