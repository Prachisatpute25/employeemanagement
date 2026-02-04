#!/bin/bash

# Debug Script for Employee Management System Deployment

echo "============================================="
echo "   🔍 EMPLOYEE MANAGEMENT SYSTEM DIAGNOSTIC   "
echo "============================================="

echo ""
echo "--- 1. Checking Docker Containers ---"
sudo docker ps -a

echo ""
echo "--- 2. Checking Backend Logs (Last 50 lines) ---"
sudo docker logs --tail 50 ems_backend

echo ""
echo "--- 3. Testing Local Backend Connectivity ---"
# Check if backend responds locally (should be 200 OK now)
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:8000/api/employees)
echo "Curl to http://localhost:8000/api/employees returned: $HTTP_STATUS"

echo ""
echo "--- 4. Testing Nginx Proxy ---"
# Check if Nginx routes correctly
HTTP_STATUS_NGINX=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost/api/employees)
echo "Curl to http://localhost/api/employees returned: $HTTP_STATUS_NGINX"

echo ""
echo "--- 5. Checking Frontend Directory Permissions ---"
ls -ld /var/www/ems-frontend
ls -la /var/www/ems-frontend | head -n 5

echo ""
echo "--- 6. Checking Environment Variables (Masked) ---"
if [ -f backend/.env ]; then
    echo "Found backend/.env file."
    grep -v "PASSWORD" backend/.env
    
    echo ""
    echo "--- 7. Testing Database Connectivity (Network) ---"
    # Extract DB Host
    DB_HOST=$(grep DB_HOST backend/.env | cut -d '=' -f2)
    echo "Testing connection to DB_HOST: $DB_HOST on port 3306..."
    
    # Ensure netcat is installed
    if ! command -v nc >/dev/null 2>&1; then
        echo "Netcat not found. Installing..."
        sudo apt-get install -y netcat-openbsd
    fi
    
    nc -zv -w 5 "$DB_HOST" 3306
    if [ $? -eq 0 ]; then
         echo "✅ Network connection to RDS successful!"
    else
         echo "❌ Connection timed out / failed. CHECK SECURITY GROUPS!"
         echo "Action: Go to AWS Console -> RDS -> Click DB -> Connectivity & Security -> Click Security Group -> Inbound Rules -> Edit -> Add Rule -> MySQL/Aurora (3306) -> Source: Anywhere (0.0.0.0/0) (TEMPORARY CHECK)"
    fi
else
    echo "❌ ERROR: backend/.env file is MISSING!"
fi

echo ""
echo "============================================="
