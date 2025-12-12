#!/bin/bash

echo "Setting up Hustlaa database..."

# Check if PostgreSQL is running
if ! pgrep -x postgres > /dev/null; then
    echo "PostgreSQL is not running. Attempting to start..."
    
    # Try different methods to start PostgreSQL
    if command -v brew &> /dev/null; then
        brew services start postgresql@15 2>/dev/null || \
        /usr/local/opt/postgresql@15/bin/pg_ctl -D /usr/local/var/postgresql@15 start 2>/dev/null
    fi
    
    echo "Waiting for PostgreSQL to start..."
    sleep 3
fi

# Create database
echo "Creating database 'hustlaa'..."
/usr/local/opt/postgresql@15/bin/createdb hustlaa 2>/dev/null || \
createdb hustlaa 2>/dev/null || \
psql postgres -c "CREATE DATABASE hustlaa;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Database created successfully!"
else
    echo "Database may already exist or there was an error."
fi

# Run schema
echo "Running database schema..."
/usr/local/opt/postgresql@15/bin/psql hustlaa -f backend/db/schema.sql 2>/dev/null || \
psql hustlaa -f backend/db/schema.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "You can now:"
    echo "  - Register users at http://localhost:3000/register"
    echo "  - Login at http://localhost:3000/login"
    echo "  - Search artisans at http://localhost:3000/search"
else
    echo "❌ Error running schema. Please check PostgreSQL connection."
    echo ""
    echo "Try running manually:"
    echo "  psql hustlaa -f backend/db/schema.sql"
fi
