#!/bin/bash

# Mazuhi Sushi Deployment Script
# This script handles the production deployment of the Next.js application

set -e

echo "🚀 Starting Mazuhi Sushi deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www"
BUILD_DIR="$APP_DIR/.next"
PUBLIC_DIR="$APP_DIR/public"
BACKUP_DIR="$APP_DIR/backup/$(date +%Y%m%d_%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "$APP_DIR/package.json" ]; then
    print_error "package.json not found in $APP_DIR. Please run this script from the project root."
    exit 1
fi

cd "$APP_DIR"

# Create backup
print_status "Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$BUILD_DIR" ]; then
    cp -r "$BUILD_DIR" "$BACKUP_DIR/"
    print_status "Backup created at $BACKUP_DIR"
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Build the application
print_status "Building application..."
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build failed. .next directory not found."
    exit 1
fi

# Set proper permissions
print_status "Setting permissions..."
find "$BUILD_DIR" -type f -name "*.js" -exec chmod 644 {} \;
find "$BUILD_DIR" -type f -name "*.css" -exec chmod 644 {} \;
find "$PUBLIC_DIR" -type f -exec chmod 644 {} \;

# Restart the application
print_status "Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
else
    print_warning "PM2 not found. Please restart the application manually."
fi

# Test the deployment
print_status "Testing deployment..."
sleep 5

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    print_status "✅ Application is responding correctly"
else
    print_error "❌ Application is not responding. Please check the logs."
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
print_status "Don't forget to:"
echo "  1. Update your nginx configuration with the provided mazuhi.nginx.conf"
echo "  2. Restart nginx: sudo systemctl restart nginx"
echo "  3. Test the website: https://mazuhi.com"