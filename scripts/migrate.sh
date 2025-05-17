#!/bin/bash

# Remove the existing migrations directory
rm -rf prisma/migrations

# Create a new one
mkdir -p prisma/migrations

# Generate a new migration
DATABASE_URL="postgresql://eventpulse_user:eventpulse_password@localhost:5432/eventpulse" npx prisma migrate dev --name init 