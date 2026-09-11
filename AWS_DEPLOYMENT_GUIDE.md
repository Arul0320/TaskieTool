# 🚀 AWS Deployment Guide for TaskieTool

This guide provides step-by-step instructions to deploy **TaskieTool** (Frontend SPA + Express Backend + Django REST API + Nginx Reverse Proxy) onto **Amazon Web Services (AWS)** using an **EC2 Ubuntu instance** with Docker Compose.

---

## 📋 Architecture Overview

The deployed application runs in production-grade containers behind an **Nginx Reverse Proxy**:
- **Port 80/443 (Nginx Gateway)**: Single entry point accessible from the web.
- **Frontend Container**: Node.js 20 production container running the React Express SPA (Port 3000).
- **Backend Container**: Python 3.11 container running Django REST Framework with Gunicorn (Port 8000).
- **Automated Memory Swap**: Automatically creates 2GB of virtual swap memory so builds never crash on AWS Free Tier (`t2.micro` / `t3.micro`).

---

## Step 1: Launch an AWS EC2 Instance

1. Log into your [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **EC2** > **Instances** > **Launch an instance**.
3. Configure the following instance details:
   - **Name**: `TaskieTool-Server`
   - **Application and OS Images (AMI)**: Select **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type**.
   - **Architecture**: `64-bit (x86)`.
   - **Instance Type**: 
     - **Free Tier**: Select `t2.micro` (or `t3.micro` depending on region).
     - **Recommended Production**: `t3.small` (2 vCPU, 2GB RAM).
   - **Key pair (login)**: Select your existing key pair or click **Create new key pair** (e.g. `taskietool-key.pem`).
4. **Network Settings (Firewall / Security Group)**:
   - Check **Allow SSH traffic from** -> `Anywhere` (or `My IP`).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
5. **Configure Storage**:
   - Change root volume size from 8 GB to **20 GB** (General Purpose SSD `gp3` is Free Tier eligible up to 30 GB).
6. Click **Launch instance**.

---

## Step 2: Connect to Your EC2 Instance

1. Open your terminal (PowerShell, Command Prompt, or Mac/Linux terminal) on your computer.
2. Navigate to the folder containing your downloaded `.pem` key file:
   ```bash
   # On Windows PowerShell / Command Prompt:
   ssh -i "path\to\taskietool-key.pem" ubuntu@<EC2-PUBLIC-IP>

   # On macOS / Linux (set permissions first):
   chmod 400 taskietool-key.pem
   ssh -i taskietool-key.pem ubuntu@<EC2-PUBLIC-IP>
   ```
   *(Replace `<EC2-PUBLIC-IP>` with the IPv4 address shown in the EC2 console).*

---

## Step 3: Copy Your Code to the EC2 Instance

### Option A: Using Git (Fastest & Recommended)
If your repository is on GitHub / GitLab:
```bash
# On your EC2 terminal:
git clone https://github.com/Arul0320/TaskieTool.git taskietool
cd taskietool
```

### Option B: Using SCP / File Upload
From your local Windows computer terminal:
```bash
scp -i "path\to\taskietool-key.pem" -r "e:\TaskieTool-main\TaskieTool-main" ubuntu@<EC2-PUBLIC-IP>:~/taskietool
```

---

## Step 4: Run the 1-Click Deployment Script

Once inside the `taskietool` directory on your EC2 instance:
```bash
# 1. Make the deployment script executable
chmod +x deploy_aws.sh

# 2. Run the deployment
./deploy_aws.sh
```

### What `deploy_aws.sh` Does Automatically:
1. Updates system packages (`apt update && apt upgrade`).
2. Creates and configures a **2GB swap file** to guarantee build stability on micro instances.
3. Automatically installs Docker engine and the Docker Compose plugin.
4. Configures UFW firewall rules for ports 22, 80, and 443.
5. Builds and launches the frontend, backend, and Nginx containers in background daemon mode.
6. Displays your live public web addresses.

---

## Step 5: Access Your Live Application

Open your web browser and visit:

| Service | URL | Description |
|---|---|---|
| **TaskieTool Web Application** | `http://<EC2-PUBLIC-IP>` | Full interactive Kanban & Activity Dashboard |
| **Django REST API** | `http://<EC2-PUBLIC-IP>/django-api/` | Browsable REST Framework API |
| **Django Administration** | `http://<EC2-PUBLIC-IP>/admin/` | Backend Database Admin Portal |

---

## Step 6: Management & Operations

### View Real-Time Container Logs
```bash
sudo docker compose logs -f
```

### Check Container Status
```bash
sudo docker compose ps
```

### Restart All Services
```bash
sudo docker compose restart
```

### Update Code & Redeploy
```bash
git pull
sudo docker compose up -d --build
```

### Create a Django Superuser (For Admin Portal)
```bash
sudo docker compose exec api-backend python manage.py createsuperuser
```

---

## Step 7: (Optional) Free SSL Certificate with Let's Encrypt

If you connect a custom domain (e.g. `taskie.yourdomain.com` pointing an A-record to your EC2 Public IP), you can enable HTTPS with Certbot:

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain and configure certificate
sudo certbot --nginx -d taskie.yourdomain.com
```

Your site will automatically serve encrypted HTTPS traffic on port 443 with automated certificate renewals!
