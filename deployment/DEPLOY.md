# Deployment Guide: AWS EC2 & RDS

This guide details how to deploy the Employee Management System to AWS using EC2 for the application and RDS for the database.

## Prerequisites

- AWS Account
- AWS CLI (optional, for easier management)
- Terminal/SSH client

## Step 1: Create RDS Instance

1. Go to the [AWS Console](https://console.aws.amazon.com/).
2. Navigate to **RDS** > **Databases** > **Create database**.
3. Choose **Standard create** > **MySQL**.
4. Select **Template**: Free tier (if eligible) or Dev/Test.
5. **Settings**:
   - DB instance identifier: `employee-db`
   - Master username: `admin` (or your preferred user)
   - Master password: `your-secure-password`
6. **Connectivity**:
   - Public access: **Yes** (Simplifies connection from EC2, restrict via Security Groups later).
   - VPC Security Group: Create new, allow traffic from your IP (for testing) and later from EC2.
7. Click **Create database**.
8. Wait for it to become **Available** and note the **Endpoint**.

## Step 2: Initialize Database

Connect to your RDS instance from your local machine to create the table structure.

```bash
mysql -h <RDS_ENDPOINT> -P 3306 -u admin -p
```

Inside the MySQL shell, paste the contents of `init.sql`:

```sql
CREATE DATABASE employee_db;
USE employee_db;
-- Paste the rest of init.sql content here
```

## Step 3: Launch EC2 Instance

1. Navigate to **EC2** > **Instances** > **Launch Instances**.
2. **Name**: `EmployeeApp`.
3. **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type.
4. **Instance Type**: t2.micro (Free tier eligible).
5. **Key pair**: Create a new one or use existing (`ems-key-pair.pem`).
6. **Network settings**:
   - Allow HTTP traffic from the internet.
   - Allow SSH traffic from your IP.
7. Launch instance.

## Step 4: Deploy Application

1. **Push Changes to GitHub (Important)**:
   Since the EC2 instance will pull code from GitHub, you must commit and push the new deployment files (`docker-compose.ec2.yml`, `nginx/nginx.conf`, `deployment/setup_ec2.sh`) to your repository first.
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **SSH into EC2 (Ubuntu)**:
   ```bash
   chmod 400 path/to/key-pair.pem
   ssh -i path/to/key-pair.pem ubuntu@<EC2_PUBLIC_IP>
   ```

3. **Run Setup Script (on EC2)**:
   You can copy just the setup script or create it on the server.
   ```bash
   nano setup_ec2.sh
   # Paste content of setup_ec2.sh here
   chmod +x setup_ec2.sh
   ./setup_ec2.sh
   exit
   ```

4. **Start Application (Reconnect SSH)**:
   ssh back in to refresh group membership.
   ```bash
   cd ~/employeemanagement
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env file with your RDS details
   nano .env
   # Update DB_HOST, DB_USER, DB_PASSWORD with your RDS info
   
   # Start the application
   docker-compose -f docker-compose.ec2.yml up -d --build
   ```

## Step 5: Verify Deployment

1. Open your browser and visit `http://<EC2_PUBLIC_IP>`.
2. The application should load.
3. Try adding an employee to verify the database connection.

## Troubleshooting

- **500 Bad Gateway / Internal Server Error**: 
  - **Check Backend Logs**: Run `docker-compose -f docker-compose.ec2.yml logs backend`.
    - If you see `Database connection failed`, it means the backend cannot reach RDS.
  - **Verify Environment Variables**: Ensure `DB_HOST`, `DB_USER`, etc., were correctly exported before running `docker-compose up`. 
    - You can inspect the running container's env vars: `docker container inspect ems_backend`.
  - **Check RDS Security Group**: 
    - Go to AWS Console > RDS > Databases > Click your DB > Connectivity & security.
    - Click the **VPC security groups** link.
    - **Inbound rules**: Ensure there is a rule allowing **MYSQL/Aurora (Port 3306)** from **Anywhere (0.0.0.0/0)** (for testing) or from the **EC2 instance's Private IP/Security Group**.
  - **Check Database Initialization**: Did you run the `init.sql` script?

- **Database Connection Error**:
  - Check RDS Security Group: Must allow inbound traffic on port 3306 from the EC2 instance's Private IP (or Security Group).
- **Frontend not loading**: Check EC2 Security Group: Must allow inbound HTTP (port 80).
