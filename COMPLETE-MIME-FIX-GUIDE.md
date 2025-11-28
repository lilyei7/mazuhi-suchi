# 🚀 Complete MIME Types Fix Guide for Mazuhi Sushi

## Problem Diagnosis
Your website is serving all files (JS, CSS) as `text/html` instead of their correct MIME types. This is because:

1. **Next.js is running on port 3000** but nginx is not proxying requests to it
2. **nginx is returning 404 errors** as text/html instead of forwarding to the app
3. **Static files are not being served correctly** from the Next.js backend

## Solution: Complete Fix

### Step 1: Verify Next.js is Running
```bash
# Check if Next.js app is running
pm2 list

# If not running, start it
pm2 start ecosystem.config.js
# OR
npm run dev
```

### Step 2: Run the Complete Fix Script
```bash
sudo /var/www/complete-nginx-fix.sh
```

This script will:
- ✅ Backup your current nginx configuration
- ✅ Install the corrected nginx configuration that proxies to Next.js
- ✅ Verify MIME types are properly configured
- ✅ Restart nginx and test the setup
- ✅ Show you the results

### Step 3: Verify the Fix

**Check headers for JavaScript files:**
```bash
curl -I https://mazuhi.com/_next/static/chunks/next-0d49c2200223caa4.js
```

You should see:
```
Content-Type: application/javascript; charset=utf-8
Cache-Control: public, immutable, max-age=31536000
```

**Check headers for CSS files:**
```bash
curl -I https://mazuhi.com/_next/static/css/247755a6344f7044.css
```

You should see:
```
Content-Type: text/css; charset=utf-8
Cache-Control: public, immutable, max-age=31536000
```

## Troubleshooting

### If you still see errors:

**1. Verify Next.js is running on port 3000:**
```bash
curl http://localhost:3000
```

If this fails, start Next.js:
```bash
cd /var/www
pm2 start ecosystem.config.js
# or
npm run dev
```

**2. Check nginx is serving from the right config:**
```bash
sudo nginx -T | grep -A 20 "server_name mazuhi.com"
```

**3. Check nginx error log:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**4. Verify configuration is installed:**
```bash
ls -la /etc/nginx/sites-enabled/
```

You should see:
```
mazuhi -> /etc/nginx/sites-available/mazuhi
```

**5. Test nginx configuration:**
```bash
sudo nginx -t
```

**6. Restart nginx and Next.js:**
```bash
sudo systemctl restart nginx
pm2 restart ecosystem.config.js
```

## Important Files

- **New fixed config:** `/var/www/mazuhi-fixed.nginx.conf`
- **Fix script:** `/var/www/complete-nginx-fix.sh`
- **Logs:** `/var/log/nginx/error.log`

## What Changed

The key difference in the fixed configuration:
- **Before:** nginx tried to serve files directly from disk (which don't exist)
- **After:** nginx proxies ALL requests to Next.js running on port 3000, which serves them with correct MIME types

```nginx
# Before (WRONG)
location /_next/static/ {
    root /var/www;  # Looks for files that don't exist
}

# After (CORRECT)
location /_next/static/ {
    proxy_pass http://nextjs_backend;  # Forwards to Next.js on port 3000
    add_header Content-Type "application/javascript; charset=utf-8" always;
}
```

## Deployment Checklist

- [ ] Verify Next.js is running: `pm2 list`
- [ ] Run fix script: `sudo /var/www/complete-nginx-fix.sh`
- [ ] Test CSS files load: Check Network tab in browser DevTools
- [ ] Test JS files load: Check Network tab in browser DevTools
- [ ] Monitor logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Check website is responsive: https://mazuhi.com

## Contact Support

If issues persist after following these steps, check:
1. SSL certificates are valid: `sudo openssl s_client -connect mazuhi.com:443`
2. DNS resolves correctly: `nslookup mazuhi.com`
3. Firewall allows ports 80/443: `sudo ufw status`