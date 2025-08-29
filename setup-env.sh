#!/bin/bash

echo "Setting up Vercel environment variables..."

# Add frontend environment variables
echo "Adding VITE_SUPABASE_URL..."
echo "https://ztldppmwixnmhldlxomo.supabase.co" | npx vercel env add VITE_SUPABASE_URL production

echo "Adding VITE_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bGRwcG13aXhubWhsZGx4b21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzk5NDksImV4cCI6MjA3MjA1NTk0OX0.jw85pMBLoZvtEDS7zggm-76RLmxH-qP6cba1XP4C57w" | npx vercel env add VITE_SUPABASE_ANON_KEY production

# Add backend environment variables
echo "Adding SUPABASE_URL..."
echo "https://ztldppmwixnmhldlxomo.supabase.co" | npx vercel env add SUPABASE_URL production

echo "Adding SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bGRwcG13aXhubWhsZGx4b21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Nzk5NDksImV4cCI6MjA3MjA1NTk0OX0.jw85pMBLoZvtEDS7zggm-76RLmxH-qP6cba1XP4C57w" | npx vercel env add SUPABASE_ANON_KEY production

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bGRwcG13aXhubWhsZGx4b21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ3OTk0OSwiZXhwIjoyMDcyMDU1OTQ5fQ.RgpU5W6Ud51ZDKfhh8ejLs-VAGfPodtMiEQqMonOk2Y" | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Environment variables setup complete!"
