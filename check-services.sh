#!/bin/bash

echo "=== MAZUHI SERVICES STATUS ==="
echo ""
echo "1. Next.js Frontend (mazuhi-web) - via PM2"
echo "   Port: 3000 (localhost), HTTPS: https://mazuhi.com/"
pm2 status mazuhi-web 2>/dev/null | grep -E "name|status|memory|cpu|↺" || echo "   Status: Not running in PM2"
echo ""

echo "2. Django POS System (suchilitoo2) - via systemd"
echo "   Port: 8000 (localhost), HTTPS: https://pos.mazuhi.com/"
systemctl is-active suchilitoo2.service > /dev/null && echo "   Status: ACTIVE" || echo "   Status: INACTIVE"
systemctl status suchilitoo2.service 2>/dev/null | grep "Active:" || true
echo ""

echo "3. Quick Health Checks:"
echo -n "   mazuhi.com: "
curl -s -o /dev/null -w "%{http_code}" https://mazuhi.com/ && echo "" || echo "ERROR"

echo -n "   pos.mazuhi.com: "
curl -s -o /dev/null -w "%{http_code}" https://pos.mazuhi.com/ && echo "" || echo "ERROR"

echo ""
echo "=== PM2 PROCESS LIST ==="
pm2 list

echo ""
echo "=== PROCESS MANAGERS ==="
echo "PM2 (Node.js): $(pm2 status | grep -c online) apps online"
echo "Systemd (Django): $(systemctl is-active suchilitoo2.service)"
echo ""
echo "=== LOGS COMMANDS ==="
echo "View Next.js logs: pm2 logs mazuhi-web"
echo "View Django logs: sudo journalctl -u suchilitoo2.service -f"
echo "View PM2 errors: pm2 logs mazuhi-web --err"
