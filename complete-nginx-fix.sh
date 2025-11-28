#!/bin/bash

# Complete MIME Types and Nginx Configuration Fix for Mazuhi Sushi

set -e

echo "🔧 Starting Complete Nginx Configuration Fix..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Step 1: Check if nginx is installed
print_info "Step 1: Checking prerequisites..."
if ! command -v nginx &> /dev/null; then
    print_error "nginx is not installed. Please install it first: sudo apt-get install nginx"
    exit 1
fi
print_status "nginx is installed"

# Step 2: Check if Next.js is running on port 3000
print_info "Step 2: Checking Next.js application..."
if ! curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    print_warning "Next.js does not appear to be running on port 3000"
    print_info "Please ensure your Next.js application is running before continuing"
else
    print_status "Next.js is running on port 3000"
fi

# Step 3: Backup current nginx config
print_info "Step 3: Backing up current nginx configuration..."
if [ -f "/etc/nginx/sites-enabled/mazuhi" ] || [ -f "/etc/nginx/sites-available/mazuhi" ]; then
    BACKUP_DIR="/var/backups/nginx-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    [ -f "/etc/nginx/sites-available/mazuhi" ] && cp /etc/nginx/sites-available/mazuhi "$BACKUP_DIR/"
    [ -f "/etc/nginx/sites-enabled/mazuhi" ] && cp /etc/nginx/sites-enabled/mazuhi "$BACKUP_DIR/"
    print_status "Backup created at $BACKUP_DIR"
fi

# Step 4: Copy the fixed nginx configuration
print_info "Step 4: Installing fixed nginx configuration..."
cp /var/www/mazuhi-fixed.nginx.conf /etc/nginx/sites-available/mazuhi
ln -sf /etc/nginx/sites-available/mazuhi /etc/nginx/sites-enabled/mazuhi
print_status "Fixed configuration installed"

# Step 5: Disable default nginx site if it exists
print_info "Step 5: Disabling default nginx site..."
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
    print_status "Default site disabled"
fi

# Step 6: Test nginx configuration
print_info "Step 6: Testing nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_status "nginx configuration is valid"
else
    print_error "nginx configuration test failed"
    print_info "Running diagnostic..."
    sudo nginx -t
    exit 1
fi

# Step 7: Check and configure mime.types
print_info "Step 7: Verifying MIME types..."
MIME_FILE="/etc/nginx/mime.types"

if ! grep -q "application/javascript" "$MIME_FILE"; then
    print_warning "JavaScript MIME type not found in mime.types, adding it..."
    # Backup mime.types
    sudo cp "$MIME_FILE" "${MIME_FILE}.backup"
    # Add JavaScript MIME type
    sudo sed -i '/types {/a \        application/javascript                      js mjs;' "$MIME_FILE"
    print_status "JavaScript MIME type added"
else
    print_status "JavaScript MIME type is configured"
fi

# Step 8: Restart nginx
print_info "Step 8: Restarting nginx..."
sudo systemctl restart nginx
if systemctl is-active --quiet nginx; then
    print_status "nginx restarted successfully"
else
    print_error "Failed to restart nginx"
    sudo systemctl status nginx
    exit 1
fi

# Step 9: Test connectivity
print_info "Step 9: Testing website connectivity..."
sleep 2

if curl -s -f http://localhost:3000 > /dev/null; then
    print_status "Localhost connection working"
else
    print_warning "Cannot connect to localhost:3000 - ensure Next.js is running"
fi

# Step 10: Check MIME types on live server
print_info "Step 10: Checking MIME types on production..."
echo ""
echo "Testing MIME types for static assets:"
echo ""

# Test JavaScript
echo -n "JavaScript files: "
JS_MIME=$(curl -s -I https://mazuhi.com/_next/static/chunks/next-0d49c2200223caa4.js 2>/dev/null | grep -i "content-type" || echo "Not found")
if echo "$JS_MIME" | grep -q "application/javascript"; then
    echo -e "${GREEN}✓ application/javascript${NC}"
else
    echo -e "${RED}✗ $JS_MIME${NC}"
fi

# Test CSS
echo -n "CSS files: "
CSS_MIME=$(curl -s -I https://mazuhi.com/_next/static/css/247755a6344f7044.css 2>/dev/null | grep -i "content-type" || echo "Not found")
if echo "$CSS_MIME" | grep -q "text/css"; then
    echo -e "${GREEN}✓ text/css${NC}"
else
    echo -e "${RED}✗ $CSS_MIME${NC}"
fi

# Step 11: Final verification
print_info "Step 11: Final verification..."
echo ""

# Check nginx status
if systemctl is-active --quiet nginx; then
    print_status "nginx is running"
else
    print_error "nginx is not running"
fi

# Check if configuration is loaded
if [ -L "/etc/nginx/sites-enabled/mazuhi" ]; then
    print_status "Mazuhi configuration is enabled"
else
    print_error "Mazuhi configuration is not enabled"
fi

# Summary
echo ""
echo "========================================="
echo -e "${GREEN}🎉 Configuration Fix Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify that Next.js is running: sudo pm2 list"
echo "2. Check logs if issues persist: sudo journalctl -u nginx -n 50"
echo "3. Test the website: https://mazuhi.com"
echo ""
echo "If you still see MIME type errors:"
echo "  - Ensure SSL certificates are properly configured"
echo "  - Check that Next.js is actually running on port 3000"
echo "  - Review nginx error log: sudo tail -f /var/log/nginx/error.log"
echo ""