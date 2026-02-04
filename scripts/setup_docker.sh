#!/bin/bash

# Setup Script for Docker Deployment on Ubuntu VM

# Exit on error
set -e
# Enable debug mode to see executed commands
set -x

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Get the project root directory (parent of scripts/)
APP_DIR="$(dirname "$SCRIPT_DIR")"

echo "Detected APP_DIR: $APP_DIR"

echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing Docker..."
# Add Docker's official GPG key:
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
fi

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Starting Docker Service..."
sudo systemctl start docker
sudo systemctl enable docker

# Check if Nginx is running and stop it/ensure it proxies effectively
# In our architecture, Nginx (Host) -> Localhost:8000 (Docker Container)
# So we make sure Nginx IS running and configured, but we DON'T need the systemd service for python anymore.

echo "Stopping local Systemd backend service (if active)..."
sudo systemctl stop ems-backend || true
sudo systemctl disable ems-backend || true

# Copy Frontend Files to /var/www/ems-frontend (to avoid permission issues)
echo "Deploying Frontend Files..."
sudo mkdir -p /var/www/ems-frontend
# Clean up old files
sudo rm -rf /var/www/ems-frontend/*
# Copy new files
if [ -d "$APP_DIR/frontend" ]; then
    sudo cp -r "$APP_DIR/frontend/"* /var/www/ems-frontend/
else
    echo "ERROR: Frontend directory not found at $APP_DIR/frontend"
    exit 1
fi

sudo chown -R www-data:www-data /var/www/ems-frontend
sudo chmod -R 755 /var/www/ems-frontend

# List files to verify
echo "Verifying /var/www/ems-frontend content:"
ls -la /var/www/ems-frontend

echo "Configuring Nginx (if not already done)..."
# We reuse the same Nginx config because it points to localhost:8000
# And Docker will expose port 8000 on localhost.
sudo cp "$APP_DIR/deployment/nginx.conf" /etc/nginx/sites-available/ems
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default || true
fi
if [ ! -f /etc/nginx/sites-enabled/ems ]; then
    sudo ln -s /etc/nginx/sites-available/ems /etc/nginx/sites-enabled/
fi
sudo systemctl restart nginx

echo "Building and Starting Docker Containers..."
cd "$APP_DIR"

# Verify if the code fix is present
if grep -q 'prefix="/api"' "$APP_DIR/backend/app/main.py"; then
    echo "✅ Code fix verified: prefix='/api' found in main.py"
else
    echo "⚠️ Code fix NOT found in main.py. Attempting to pull latest..."
    git pull
fi

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "ERROR: backend/.env file not found! Please create it with your DB credentials."
    exit 1
fi

# Force stop and remove old containers to ensure clean rebuild
sudo docker compose -f docker-compose.prod.yml down --rmi local
sudo docker compose -f docker-compose.prod.yml up -d --build

echo "Docker Deployment Complete!"
sudo docker ps
