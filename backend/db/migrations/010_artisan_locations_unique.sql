-- Ensure artisan_locations supports upsert by artisan_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_artisan_locations_artisan_id_unique ON artisan_locations(artisan_id);
