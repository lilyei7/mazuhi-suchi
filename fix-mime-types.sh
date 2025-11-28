#!/bin/bash

# MIME Types Fix Script for Mazuhi Sushi
# This script checks and fixes MIME type issues for Next.js static files

set -e

echo "🔍 Checking MIME types configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "nginx is not installed. Please install nginx first."
    exit 1
fi

# Check nginx configuration
print_status "Checking nginx configuration..."

# Check if our config is in sites-available
if [ -f "/etc/nginx/sites-available/mazuhi" ]; then
    print_status "✅ Mazuhi nginx config found"
else
    print_warning "❌ Mazuhi nginx config not found in /etc/nginx/sites-available/"
    print_status "Copying configuration..."
    sudo cp /var/www/mazuhi.nginx.conf /etc/nginx/sites-available/mazuhi
    sudo ln -sf /etc/nginx/sites-available/mazuhi /etc/nginx/sites-enabled/
    print_status "✅ Nginx config installed"
fi

# Check nginx mime.types
print_status "Checking MIME types configuration..."
if grep -q "application/javascript" /etc/nginx/mime.types; then
    print_status "✅ JavaScript MIME type is configured"
else
    print_warning "❌ JavaScript MIME type missing. Adding..."
    sudo sed -i '/types {/a \        application/javascript                      js;' /etc/nginx/mime.types
    print_status "✅ JavaScript MIME type added"
fi

# Test nginx configuration
print_status "Testing nginx configuration..."
if sudo nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration has errors. Please check the config."
    exit 1
fi

# Restart nginx
print_status "Restarting nginx..."
sudo systemctl restart nginx

# Test the website
print_status "Testing website..."
sleep 3

# Test a JavaScript file
JS_TEST=$(curl -s -I https://mazuhi.com/_next/static/chunks/next-0d49c2200223caa4.js | grep -i "content-type" || echo "No content-type header")

if echo "$JS_TEST" | grep -q "application/javascript"; then
    print_status "✅ JavaScript files are served with correct MIME type"
else
    print_warning "❌ JavaScript MIME type issue persists"
    echo "Current headers: $JS_TEST"
fi

# Test main page
MAIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://mazuhi.com/)
if [ "$MAIN_TEST" = "200" ]; then
    print_status "✅ Main page loads successfully"
else
    print_error "❌ Main page returned HTTP $MAIN_TEST"
fi

print_status "🎉 MIME types check completed!"
print_status "If issues persist, please check:"
echo "  1. SSL certificates are properly configured"
echo "  2. Domain DNS points to correct server"
echo "  3. Firewall allows HTTP/HTTPS traffic"