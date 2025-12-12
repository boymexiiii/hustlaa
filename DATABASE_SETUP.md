# Database Setup Instructions

The application requires PostgreSQL to be running. Here are the steps to set it up:

## Option 1: Quick Setup (Recommended)

Run these commands in your terminal:

```bash
# 1. Start PostgreSQL (it's already installed)
brew services restart postgresql@15

# 2. Wait a few seconds for it to start, then create the database
sleep 5
createdb hustlaa

# 3. Run the schema
psql hustlaa -f backend/db/schema.sql
```

## Option 2: Manual Setup

If Option 1 doesn't work, try these steps:

### Step 1: Start PostgreSQL
```bash
# Try one of these commands:
brew services start postgresql@15
# OR
/usr/local/opt/postgresql@15/bin/pg_ctl -D /usr/local/var/postgresql@15 start
```

### Step 2: Create the Database
```bash
# Using createdb command
createdb hustlaa

# OR using psql
psql postgres -c "CREATE DATABASE hustlaa;"
```

### Step 3: Run the Schema
```bash
psql hustlaa -f backend/db/schema.sql
```

## Option 3: Using the Node.js Script

```bash
cd backend
node db/setup.js
```

## Verify Setup

To verify the database is set up correctly:

```bash
psql hustlaa -c "\dt"
```

You should see tables like: users, artisan_profiles, bookings, etc.

## Troubleshooting

### PostgreSQL won't start
- Check if it's already running: `ps aux | grep postgres`
- Check the log file: `tail -f /usr/local/var/log/postgresql@15.log`
- Try removing the lock file: `rm /usr/local/var/postgresql@15/postmaster.pid`

### Can't connect to database
- Verify PostgreSQL is running: `pg_isready`
- Check the port: `lsof -i :5432`
- Update the DATABASE_URL in `backend/.env` if needed

### Database exists but schema fails
- Drop and recreate: `dropdb hustlaa && createdb hustlaa`
- Then run the schema again

## Current Database Configuration

The application is configured to connect to:
- Host: localhost
- Port: 5432
- Database: hustlaa
- User: admin (your system user)

This is set in `backend/.env`:
```
DATABASE_URL=postgresql://admin@localhost:5432/hustlaa
```

## Next Steps After Setup

Once the database is running:
1. The backend server will connect automatically
2. You can register users at http://localhost:3000/register
3. Create artisan profiles and services
4. Test the booking system
