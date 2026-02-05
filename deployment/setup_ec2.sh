#!/bin/bash

# Update system
sudo apt-get update -y

# Install Docker and Git
sudo apt-get install -y docker.io git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Setup Application Directory
REPO_URL="https://github.com/Prachisatpute25/employeemanagement.git"
APP_DIR="/home/ubuntu/employeemanagement"

if [ -d "$APP_DIR" ]; then
    echo "Directory exists. Pulling latest changes..."
    cd $APP_DIR
    git pull
else
    echo "Cloning repository..."
    cd /home/ubuntu
    git clone $REPO_URL
    cd $APP_DIR
fi

echo "Setup complete. Please log out and log back in to use Docker without sudo."
echo "Then navigate to $APP_DIR and run:"
echo "export DB_HOST=your-rds-endpoint"
echo "export DB_USER=your-db-user"
echo "export DB_PASSWORD=your-db-password"
echo "export DB_NAME=employee_db"
echo "docker-compose -f docker-compose.ec2.yml up -d --build"
