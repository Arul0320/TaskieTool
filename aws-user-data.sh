#!/bin/bash
# ==============================================================================
# AWS EC2 User Data Script (Cloud-Init)
# Paste this into AWS Console -> EC2 -> Launch Instance -> Advanced Details -> User Data
# ==============================================================================

exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "🚀 Starting automated AWS EC2 initialization..."

# 1. Update and install prerequisites
apt-get update -y
apt-get upgrade -y
apt-get install -y git curl wget

# 2. Setup 2GB Swap for build stability
if [ $(free -m | awk '/^Swap:/ {print $2}') -lt 1000 ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
usermod -aG docker ubuntu

# 4. Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# 5. Clone repository or deploy code (replace with your repo URL if using Git)
mkdir -p /home/ubuntu/taskietool
cd /home/ubuntu/taskietool

# If deploying from GitHub:
# git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git .
# chmod +x deploy_aws.sh
# ./deploy_aws.sh

echo "✅ AWS EC2 Initialization Complete. Ready for deployment."
