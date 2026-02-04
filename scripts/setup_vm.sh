#!/bin/bash

# Setup Script for Employee Management System on Ubuntu VM

# Exit on error
set -e

APP_DIR="/home/ubuntu/EmployeeManagementSystem"
BACKEND_DIR="$APP_DIR/backend"
VENV_DIR="$BACKEND_DIR/venv"

echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing dependencies..."
sudo apt install -y python3-pip python3-venv nginx git

# Navigate to app directory (assuming we are already inside the repo or it's cloned to $APP_DIR)
# If running this script from the repo, we are good.

echo "Setting up Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install -r "$BACKEND_DIR/requirements.txt"

echo "Configuring Nginx..."
sudo cp "$APP_DIR/deployment/nginx.conf" /etc/nginx/sites-available/ems
# Remove default if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi
# Link configuration
if [ ! -f /etc/nginx/sites-enabled/ems ]; then
    sudo ln -s /etc/nginx/sites-available/ems /etc/nginx/sites-enabled/
fi
sudo systemctl restart nginx

echo "Configuring Systemd Service..."
sudo cp "$APP_DIR/deployment/ems-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ems-backend
sudo systemctl restart ems-backend

echo "Deployment Setup Complete!"
echo "Please make sure you have created the .env file in $BACKEND_DIR with your database credentials."
