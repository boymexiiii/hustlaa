-- Add columns to reviews table for photo uploads and helpful voting
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS unhelpful_count INTEGER DEFAULT 0;

-- Create review_votes table for tracking helpful/unhelpful votes
CREATE TABLE IF NOT EXISTS review_votes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL, -- 'helpful' or 'unhelpful'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);

-- Create review_responses table for artisan responses to reviews
CREATE TABLE IF NOT EXISTS review_responses (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  artisan_id INTEGER NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_artisan_id ON review_responses(artisan_id);
