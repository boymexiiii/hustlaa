const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./pool');

async function upsertUser({ email, password, first_name, last_name, phone, user_type }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const insert = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name, phone, user_type)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [email, hashedPassword, first_name, last_name, phone, user_type]
  );
  return insert.rows[0].id;
}

async function ensureWallet(userId) {
  await pool.query(
    `INSERT INTO wallets (user_id, balance, total_earned, total_spent)
     VALUES ($1, 0.00, 0.00, 0.00)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function ensureArtisanProfile(userId, { bio, skills, hourly_rate, availability_status, verification_status }) {
  const existing = await pool.query('SELECT id FROM artisan_profiles WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE artisan_profiles
       SET bio = COALESCE($2, bio),
           skills = COALESCE($3, skills),
           hourly_rate = COALESCE($4, hourly_rate),
           availability_status = COALESCE($5, availability_status),
           verification_status = COALESCE($6, verification_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, bio || null, skills || null, hourly_rate || null, availability_status || null, verification_status || null]
    );
    return existing.rows[0].id;
  }

  const insert = await pool.query(
    `INSERT INTO artisan_profiles (user_id, bio, skills, hourly_rate, availability_status, verification_status)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [userId, bio || null, skills || null, hourly_rate || null, availability_status || 'available', verification_status || 'verified']
  );
  return insert.rows[0].id;
}

async function upsertArtisanLocation(artisanId, { state, city, address, latitude, longitude, service_radius_km }) {
  await pool.query(
    `INSERT INTO artisan_locations (artisan_id, state, city, address, latitude, longitude, service_radius_km)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (artisan_id) DO UPDATE SET
       state = EXCLUDED.state,
       city = EXCLUDED.city,
       address = EXCLUDED.address,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude,
       service_radius_km = EXCLUDED.service_radius_km,
       updated_at = CURRENT_TIMESTAMP`,
    [artisanId, state, city, address || null, latitude, longitude, service_radius_km || 10]
  );
}

async function ensureServiceCategory({ name, description }) {
  const existing = await pool.query('SELECT id FROM service_categories WHERE name = $1', [name]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const insert = await pool.query(
    `INSERT INTO service_categories (name, description)
     VALUES ($1,$2)
     RETURNING id`,
    [name, description || null]
  );
  return insert.rows[0].id;
}

async function ensureService({ artisan_id, name, description, price, duration_minutes, category_id }) {
  const existing = await pool.query('SELECT id FROM services WHERE artisan_id = $1 AND name = $2', [artisan_id, name]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO services (artisan_id, name, description, price, duration_minutes, category_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [artisan_id, name, description || null, price, duration_minutes || null, category_id || null]
  );
  return insert.rows[0].id;
}

async function ensureBooking({ customer_id, artisan_id, service_id, booking_date, booking_time, location_address, latitude, longitude, total_amount, status }) {
  const existing = await pool.query(
    `SELECT id FROM bookings
     WHERE customer_id = $1 AND artisan_id = $2 AND service_id = $3 AND booking_date = $4 AND booking_time = $5`,
    [customer_id, artisan_id, service_id, booking_date, booking_time]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO bookings
      (customer_id, artisan_id, service_id, booking_date, booking_time, location_address, latitude, longitude, total_amount, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [customer_id, artisan_id, service_id, booking_date, booking_time, location_address || null, latitude || null, longitude || null, total_amount, status || 'confirmed']
  );

  return insert.rows[0].id;
}

async function ensurePayment({ booking_id, amount, payment_method, transaction_id, status }) {
  const existing = await pool.query('SELECT id FROM payments WHERE booking_id = $1', [booking_id]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [booking_id, amount, payment_method, transaction_id || null, status || 'completed']
  );
  return insert.rows[0].id;
}

async function ensureReview({ booking_id, customer_id, artisan_id, rating, comment }) {
  const existing = await pool.query('SELECT id FROM reviews WHERE booking_id = $1', [booking_id]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO reviews (booking_id, customer_id, artisan_id, rating, comment)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [booking_id, customer_id, artisan_id, rating, comment || null]
  );

  await pool.query(
    `UPDATE artisan_profiles
     SET rating = (SELECT AVG(rating) FROM reviews WHERE artisan_id = $1),
         total_reviews = (SELECT COUNT(*) FROM reviews WHERE artisan_id = $1)
     WHERE id = $1`,
    [artisan_id]
  );

  return insert.rows[0].id;
}

async function ensureNotificationPreferences(userId) {
  await pool.query(
    `INSERT INTO notification_preferences (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function ensureNotification({ user_id, type, title, message, reference_id, reference_type }) {
  const existing = await pool.query(
    `SELECT id FROM notifications WHERE user_id = $1 AND type = $2 AND title = $3 AND reference_id IS NOT DISTINCT FROM $4`,
    [user_id, type, title, reference_id || null]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [user_id, type, title, message, reference_id || null, reference_type || null]
  );
  return insert.rows[0].id;
}

async function ensureJob({ customer_id, title, category, description, state, city, address, budget_min, budget_max, status }) {
  const existing = await pool.query('SELECT id FROM jobs WHERE customer_id = $1 AND title = $2', [customer_id, title]);
  if (existing.rows.length > 0) return existing.rows[0].id;

  const insert = await pool.query(
    `INSERT INTO jobs (customer_id, title, category, description, state, city, address, budget_min, budget_max, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [customer_id, title, category, description, state || null, city || null, address || null, budget_min || null, budget_max || null, status || 'open']
  );
  return insert.rows[0].id;
}

async function seed() {
  console.log('Seeding database...');

  // Categories
  const catPlumbing = await ensureServiceCategory({ name: 'Plumbing', description: 'Plumbing services' });
  const catElectrical = await ensureServiceCategory({ name: 'Electrical', description: 'Electrical services' });
  const catCarpentry = await ensureServiceCategory({ name: 'Carpentry', description: 'Carpentry services' });

  // Users
  const customer1 = await upsertUser({
    email: 'customer1@hustlaa.local',
    password: 'password123',
    first_name: 'Ada',
    last_name: 'Okafor',
    phone: '08000000001',
    user_type: 'customer',
  });

  const customer2 = await upsertUser({
    email: 'customer2@hustlaa.local',
    password: 'password123',
    first_name: 'Tunde',
    last_name: 'Adebayo',
    phone: '08000000002',
    user_type: 'customer',
  });

  const artisanUser1 = await upsertUser({
    email: 'artisan1@hustlaa.local',
    password: 'password123',
    first_name: 'Chinedu',
    last_name: 'Eze',
    phone: '08000000011',
    user_type: 'artisan',
  });

  const artisanUser2 = await upsertUser({
    email: 'artisan2@hustlaa.local',
    password: 'password123',
    first_name: 'Fatima',
    last_name: 'Sani',
    phone: '08000000012',
    user_type: 'artisan',
  });

  const artisanUser3 = await upsertUser({
    email: 'artisan3@hustlaa.local',
    password: 'password123',
    first_name: 'Segun',
    last_name: 'Ola',
    phone: '08000000013',
    user_type: 'artisan',
  });

  // Wallet + preferences
  for (const uid of [customer1, customer2, artisanUser1, artisanUser2, artisanUser3]) {
    await ensureWallet(uid);
    await ensureNotificationPreferences(uid);
  }

  // Artisans
  const artisan1 = await ensureArtisanProfile(artisanUser1, {
    bio: 'Certified plumber with 8 years experience.',
    skills: ['Plumber', 'Pipe Repair', 'Leak Fix'],
    hourly_rate: 12000,
    availability_status: 'available',
    verification_status: 'verified',
  });

  const artisan2 = await ensureArtisanProfile(artisanUser2, {
    bio: 'Professional electrician for residential and office jobs.',
    skills: ['Electrician', 'Wiring', 'AC Installation'],
    hourly_rate: 15000,
    availability_status: 'available',
    verification_status: 'verified',
  });

  const artisan3 = await ensureArtisanProfile(artisanUser3, {
    bio: 'Carpenter and furniture maker.',
    skills: ['Carpenter', 'Furniture', 'Wardrobe'],
    hourly_rate: 18000,
    availability_status: 'available',
    verification_status: 'verified',
  });

  await upsertArtisanLocation(artisan1, {
    state: 'Lagos',
    city: 'Lekki',
    address: 'Lekki Phase 1',
    latitude: 6.4474,
    longitude: 3.4727,
    service_radius_km: 25,
  });

  await upsertArtisanLocation(artisan2, {
    state: 'FCT',
    city: 'Wuse',
    address: 'Wuse Zone 2',
    latitude: 9.0765,
    longitude: 7.3986,
    service_radius_km: 25,
  });

  await upsertArtisanLocation(artisan3, {
    state: 'Lagos',
    city: 'Ikeja',
    address: 'Ikeja GRA',
    latitude: 6.6018,
    longitude: 3.3515,
    service_radius_km: 25,
  });

  // Services
  const service1 = await ensureService({
    artisan_id: artisan1,
    name: 'Kitchen Plumbing Repair',
    description: 'Fix leaks, replace pipes, install sinks.',
    price: 20000,
    duration_minutes: 120,
    category_id: catPlumbing,
  });

  const service2 = await ensureService({
    artisan_id: artisan2,
    name: 'Residential Electrical Installation',
    description: 'Wiring and electrical setup for homes.',
    price: 80000,
    duration_minutes: 240,
    category_id: catElectrical,
  });

  const service3 = await ensureService({
    artisan_id: artisan3,
    name: 'Custom Wardrobe Design',
    description: 'Design and build custom wardrobes.',
    price: 150000,
    duration_minutes: 480,
    category_id: catCarpentry,
  });

  // Bookings + payments + reviews
  const booking1 = await ensureBooking({
    customer_id: customer1,
    artisan_id: artisan1,
    service_id: service1,
    booking_date: '2025-12-15',
    booking_time: '10:00:00',
    location_address: 'Lekki Phase 1',
    latitude: 6.4474,
    longitude: 3.4727,
    total_amount: 20000,
    status: 'completed',
  });

  await ensurePayment({
    booking_id: booking1,
    amount: 20000,
    payment_method: 'wallet',
    transaction_id: 'seed_tx_1',
    status: 'completed',
  });

  await ensureReview({
    booking_id: booking1,
    customer_id: customer1,
    artisan_id: artisan1,
    rating: 5,
    comment: 'Fast and professional service. Highly recommended!',
  });

  const booking2 = await ensureBooking({
    customer_id: customer2,
    artisan_id: artisan2,
    service_id: service2,
    booking_date: '2025-12-18',
    booking_time: '14:00:00',
    location_address: 'Wuse, Abuja',
    latitude: 9.0765,
    longitude: 7.3986,
    total_amount: 80000,
    status: 'confirmed',
  });

  await ensurePayment({
    booking_id: booking2,
    amount: 80000,
    payment_method: 'card',
    transaction_id: 'seed_tx_2',
    status: 'completed',
  });

  await ensureNotification({
    user_id: customer2,
    type: 'booking',
    title: 'Booking confirmed',
    message: 'Your booking is confirmed and scheduled.',
    reference_id: booking2,
    reference_type: 'booking',
  });

  // Jobs
  await ensureJob({
    customer_id: customer1,
    title: 'Fix leaking bathroom pipes',
    category: 'Plumber',
    description: 'Need a plumber to fix leaking pipes and replace a faulty valve.',
    state: 'Lagos',
    city: 'Lekki',
    address: 'Lekki Phase 1',
    budget_min: 15000,
    budget_max: 30000,
    status: 'open',
  });

  await ensureJob({
    customer_id: customer2,
    title: 'Install 2 AC units',
    category: 'Electrician',
    description: 'Install two split AC units in a 2-bedroom apartment.',
    state: 'FCT',
    city: 'Wuse',
    address: 'Wuse Zone 2',
    budget_min: 40000,
    budget_max: 70000,
    status: 'open',
  });

  console.log('✅ Seed complete');
  console.log('Seed logins:');
  console.log('- customer1@hustlaa.local / password123');
  console.log('- customer2@hustlaa.local / password123');
  console.log('- artisan1@hustlaa.local / password123');
  console.log('- artisan2@hustlaa.local / password123');
  console.log('- artisan3@hustlaa.local / password123');
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    pool.end().finally(() => process.exit(1));
  });
