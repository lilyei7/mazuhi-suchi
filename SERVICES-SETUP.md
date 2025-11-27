# Mazuhi Restaurant Services - Deployment Guide

## Overview

Two production services are deployed and configured for auto-restart with monitoring:

1. **https://mazuhi.com/** - Next.js Frontend Restaurant Website
   - Process Manager: **PM2** (with auto-restart)
   - Port: 3000 (internal)
   - Process Name: `mazuhi-web`
   
2. **https://pos.mazuhi.com/** - Django POS (Point of Sale) System
   - Process Manager: **systemd** (with auto-restart)
   - Port: 8000 (internal)
   - Service Name: `suchilitoo2.service`

## Service Status

Check current status:
```bash
/var/www/check-services.sh
```

Or manually:
```bash
# Next.js Frontend
pm2 list

# Django POS
systemctl status suchilitoo2.service
```

## Logs

View logs in real-time:

```bash
# Next.js Frontend
pm2 logs mazuhi-web

# Django POS
sudo journalctl -u suchilitoo2.service -f

# PM2 errors only
pm2 logs mazuhi-web --err
```

## Auto-Restart Configuration

### Next.js (PM2)
- **File**: `/var/www/ecosystem.config.js`
- **Features**: 
  - Auto-restart on crash
  - Memory limit: 1GB (auto-restart if exceeded)
  - Fork mode (single instance)
  - Auto-startup on server reboot via PM2 startup script

**Start/Stop**:
```bash
pm2 start ecosystem.config.js  # Start
pm2 stop mazuhi-web            # Stop
pm2 restart mazuhi-web         # Restart
pm2 save                        # Save for auto-boot
```

### Django (systemd)
- **File**: `/etc/systemd/system/suchilitoo2.service`
- **Features**:
  - Auto-restart on failure
  - Gunicorn with 3 workers
  - Database: SQLite at `/var/www/suchilitoo2/db.sqlite3`
  - Auto-startup on server reboot

**Start/Stop**:
```bash
systemctl start suchilitoo2.service    # Start
systemctl stop suchilitoo2.service     # Stop
systemctl restart suchilitoo2.service  # Restart
systemctl status suchilitoo2.service   # Status
```

## Testing Services

### Health Check
```bash
# Next.js
curl -s https://mazuhi.com/ | head -c 100

# Django
curl -s https://pos.mazuhi.com/ | head -c 100
```

### API Testing
```bash
# Mazuhi API
curl https://mazuhi.com/api/menu

# Django Login (test)
curl -X POST https://pos.mazuhi.com/api/login
```

## Performance Monitoring

### Memory Usage
```bash
pm2 monit           # Real-time monitoring
pm2 list            # Quick memory check
free -h             # System memory
```

### Port Usage
```bash
lsof -i :3000      # Check port 3000
lsof -i :8000      # Check port 8000
netstat -tlnp | grep -E "3000|8000"
```

## Emergency Procedures

### If Next.js crashes:
```bash
# PM2 will auto-restart, but to manually:
pm2 restart mazuhi-web
```

### If Django crashes:
```bash
# systemd will auto-restart, but to manually:
systemctl restart suchilitoo2.service
```

### If PM2 daemon crashes:
```bash
pm2 kill          # Kill PM2
pm2 startup       # Re-setup startup
pm2 start ecosystem.config.js
pm2 save
```

### Clear PM2 logs:
```bash
pm2 logs --lines 0    # Clear logs
pm2 flush              # Alternative
```

## Configuration Files

### Next.js PM2 Config
**Location**: `/var/www/ecosystem.config.js`
- Can modify port, memory limits, instances here
- After changes: `pm2 reload ecosystem.config.js && pm2 save`

### Django Service
**Location**: `/etc/systemd/system/suchilitoo2.service`
- Modify Gunicorn workers, ports, environment variables
- After changes: `systemctl daemon-reload && systemctl restart suchilitoo2.service`

### Nginx Reverse Proxy
**Locations**:
- `/etc/nginx/sites-enabled/mazuhi.com` → proxies to localhost:3000
- `/etc/nginx/sites-enabled/pos.mazuhi.com` → proxies to localhost:8000
- Test config: `nginx -t`
- Reload: `systemctl reload nginx`

## Database

**Django Database**: `/var/www/suchilitoo2/db.sqlite3`
- Owner: www-data:www-data
- Permissions: 664
- Backup before major updates

## SSL Certificates

Both domains use Let's Encrypt via Certbot:
- Certificates auto-renew via systemd timer
- Check renewal: `sudo certbot renew --dry-run`
- Locations: `/etc/letsencrypt/live/{domain}/`

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

### Database Locked (Django)
```bash
# Check if process is hung
systemctl restart suchilitoo2.service
```

### PM2 Not Auto-Starting
```bash
# Ensure systemd service exists
systemctl status pm2-root.service

# Or reinstall
pm2 startup
pm2 save
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:3000
curl http://localhost:8000

# Check nginx logs
tail -f /var/log/nginx/error.log

# Reload nginx
systemctl reload nginx
```

## Useful Commands Summary

```bash
# Service health
/var/www/check-services.sh

# PM2 operations
pm2 list              # Process list
pm2 logs mazuhi-web   # View logs
pm2 monit             # Monitor
pm2 status            # Status

# Systemd operations
systemctl status suchilitoo2.service
journalctl -u suchilitoo2.service -f

# System monitoring
top                   # Overall system
ps aux | grep -E "node|gunicorn|nginx"
```

## Version Information

- **Node.js**: v20.x+
- **Next.js**: 14.0.0+
- **Python**: 3.x
- **Django**: 5.2.4
- **Gunicorn**: 3.x
- **PM2**: 5.x+
- **Nginx**: 1.24.0+

## Contact & Support

For issues or questions, check:
1. Service status with `/var/www/check-services.sh`
2. Recent logs via PM2 or journalctl
3. System resources with `free -h` and `df -h`
4. Port availability with `lsof -i`

---
Last Updated: 2025-11-26
Deployment Status: ✅ Both services running with auto-restart enabled
