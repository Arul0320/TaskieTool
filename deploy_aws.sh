#!/usr/bin/env bash
# ==============================================================================
# TaskieTool - Automated AWS EC2 Deployment Script
# ==============================================================================
# Run this script on your AWS EC2 Ubuntu instance:
#   chmod +x deploy_aws.sh
#   ./deploy_aws.sh
# ==============================================================================

set -e

echo "🚀 Starting TaskieTool Deployment on AWS EC2..."

# 1. Update system packages
echo "📦 Step 1/6: Updating operating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw htop

# 2. Configure 2GB Swap (Ensures 1GB t2.micro/t3.micro instances don't run out of memory during build)
echo "💾 Step 2/6: Checking system swap space..."
if [ $(free -m | awk '/^Swap:/ {print $2}') -lt 1000 ]; then
    echo "Creating 2GB swapfile for smooth builds on micro instances..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    if ! grep -q "/swapfile" /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    echo "✅ Swap configured successfully."
else
    echo "✅ Sufficient swap space already exists."
fi

# 3. Install Docker and Docker Compose plugin if not present
echo "🐳 Step 3/6: Verifying Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed."
fi

if ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    sudo apt-get install -y docker-compose-plugin
fi

echo "✅ Docker $(docker --version) ready."

# 4. Configure Firewall (UFW)
echo "🛡️ Step 4/6: Configuring Firewall..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

# 5. Build and Launch Containers
echo "🏗️ Step 5/6: Building and starting TaskieTool containers..."
# Stop existing containers if running
sudo docker compose down --remove-orphans || true

# Build and launch in background
sudo docker compose up -d --build

# 6. Verify Health
echo "🔍 Step 6/6: Verifying service health..."
sleep 8
sudo docker compose ps

# Get public IP of the EC2 instance
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://ifconfig.me || echo "<YOUR_EC2_PUBLIC_IP>")

echo ""
echo "=========================================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "=========================================================================="
echo "TaskieTool is now running on your AWS instance:"
echo ""
echo "🌐 Web Application URL : http://${PUBLIC_IP}"
echo "⚙️ Django Admin URL     : http://${PUBLIC_IP}/admin/"
echo "📡 Django REST API URL  : http://${PUBLIC_IP}/django-api/"
echo ""
echo "Useful Commands:"
echo "  - View live logs      : sudo docker compose logs -f"
echo "  - Restart all services: sudo docker compose restart"
echo "  - Stop application    : sudo docker compose down"
echo "=========================================================================="
