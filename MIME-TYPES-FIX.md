# 🚨 URGENT: MIME Types Fix Required

## Problem
Your website is experiencing MIME type errors that prevent JavaScript files from loading properly. The server is serving `.js` files as `text/html` instead of `application/javascript`.

## Error Messages
```
NS_ERROR_CORRUPTED_CONTENT
El recurso se bloqueó debido a la falta de coincidencia del tipo MIME ("text/html") (X-Content-Type-Options: nosniff)
```

## Solution

### Step 1: Update Nginx Configuration
Copy the provided nginx configuration to your server:

```bash
sudo cp /var/www/mazuhi.nginx.conf /etc/nginx/sites-available/mazuhi
sudo ln -sf /etc/nginx/sites-available/mazuhi /etc/nginx/sites-enabled/
```

### Step 2: Fix MIME Types
Run the MIME types fix script:

```bash
sudo /var/www/fix-mime-types.sh
```

### Step 3: Restart Services
```bash
sudo systemctl restart nginx
sudo /var/www/deploy.sh
```

### Step 4: Verify
Test your website: https://mazuhi.com

The JavaScript files should now load with the correct `application/javascript` MIME type.

## What Was Fixed
- ✅ Added proper MIME type headers for `.js` files
- ✅ Configured nginx to serve Next.js static files correctly
- ✅ Added security headers while maintaining functionality
- ✅ Set up proper caching for static assets

## Files Created
- `mazuhi.nginx.conf` - Nginx configuration for your site
- `fix-mime-types.sh` - Script to fix MIME type issues
- `deploy.sh` - Deployment script with proper permissions

## If Issues Persist
1. Check that SSL certificates are properly configured
2. Verify domain DNS points to the correct server
3. Ensure firewall allows HTTP/HTTPS traffic
4. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`