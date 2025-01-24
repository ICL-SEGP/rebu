#!/bin/bash
set -ex

# Update all packages
sudo dnf update -y

# Install Docker
sudo dnf install -y docker nc

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to the Docker group to avoid using sudo for Docker commands
sudo usermod -aG docker ec2-user

# Install Nmap for network scanning utilities
sudo dnf install -y nmap

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version

# Clean up unnecessary files
sudo dnf clean all
