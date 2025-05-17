#!/bin/sh

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Create the database
createdb eventpulse

# Create a user with password (you'll be prompted to enter a password)
createuser -P eventpulse_user

# Grant privileges
echo "GRANT ALL PRIVILEGES ON DATABASE eventpulse TO eventpulse_user;" | psql -U postgres eventpulse

# Display connection details
echo "Database setup complete!"
echo "Connection details:"
echo "Database: eventpulse"
echo "User: eventpulse_user"
echo "Password: (the one you just set)"
echo "Host: localhost"
echo "Port: 5432"

# Generate a secure secret for NextAuth
echo "Generating NextAuth secret..."
SECRET=$(openssl rand -base64 32)
echo "NEXTAUTH_SECRET: $SECRET"

# Create .env.local file
echo "Creating .env.local file..."
echo "DATABASE_URL=postgresql://eventpulse_user:your_password@localhost:5432/eventpulse" > .env.local
echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local

echo "Setup complete! Please update the password in .env.local with the one you set for the database user."
