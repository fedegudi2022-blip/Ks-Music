# 🚀 Deployment Guide - Kp-Music Bot

This guide covers deploying Kp-Music Bot to production environments for 24/7 operation.

## Prerequisites

- **Node.js 18+** (LTS recommended: 20.x)
- **A server/VPS** running Linux, Windows Server, or similar
- **Discord Bot Token**
- **YouTube API Key** (recommended for speed)
- **Spotify Credentials**
- **FFmpeg** (automatically installed via npm dependencies)

## 1. Server Preparation

### Windows Server
```batch
REM Install Chocolatey (if not installed)
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" ^
  -NoProfile -InputFormat None -ExecutionPolicy Bypass ^
  -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; ^
  iex ((New-Object System.Net.WebClient).DownloadString( ^
  'https://community.chocolatey.org/install.ps1'))"

REM Install dependencies
choco install nodejs git

REM Create bot directory
mkdir C:\Bots\Kp-Music
cd C:\Bots\Kp-Music
```

### Linux (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Create bot directory
sudo mkdir -p /opt/kp-music
sudo chown $USER:$USER /opt/kp-music
cd /opt/kp-music
```

## 2. Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Kp-Music.git .

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

## 3. Process Management

### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem configuration
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'kp-music',
    script: './launcher.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.music-cache.json'],
  }]
};
EOF

# Start the bot
pm2 start ecosystem.config.js

# Save PM2 startup
pm2 save
pm2 startup

# Monitor
pm2 logs kp-music
```

### Option B: Using systemd (Linux)

```bash
# Create systemd service
sudo tee /etc/systemd/system/kp-music.service > /dev/null << EOF
[Unit]
Description=Kp-Music Discord Bot
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/opt/kp-music
ExecStart=/usr/bin/node launcher.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable kp-music
sudo systemctl start kp-music

# Monitor
sudo journalctl -u kp-music -f
```

### Option C: Using Windows Service (Windows Server)

Using NSSM (Non-Sucking Service Manager):

```batch
REM Download NSSM
choco install nssm

REM Create service
nssm install KpMusic "C:\Program Files\nodejs\node.exe" "C:\Bots\Kp-Music\launcher.js"
nssm set KpMusic AppDirectory "C:\Bots\Kp-Music"
nssm set KpMusic AppStdout "C:\Bots\Kp-Music\logs\bot.log"
nssm set KpMusic AppStderr "C:\Bots\Kp-Music\logs\error.log"

REM Start service
net start KpMusic

REM View logs
type C:\Bots\Kp-Music\logs\bot.log
```

## 4. Monitoring & Logging

### Log Rotation (Linux)

```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/kp-music > /dev/null << EOF
/opt/kp-music/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 username username
    sharedscripts
    restart kp-music
}
EOF
```

### Uptime Monitoring

Monitor bot status with external monitoring services:
- **Ping: https://healthchecks.io**
- **Status Page: https://status.io**
- **Metrics: https://newrelic.com or https://datadog.com**

## 5. Backup Strategy

```bash
# Backup cache and config (daily)
#!/bin/bash
BACKUP_DIR="/opt/kp-music/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup cache
cp /opt/kp-music/.music-cache.json \
   $BACKUP_DIR/cache_$DATE.json

# Backup config (without tokens)
grep -v "_SECRET\|_TOKEN\|_ID" /opt/kp-music/.env \
   > $BACKUP_DIR/env_$DATE.backup

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup completed at $DATE"
```

## 6. Performance Optimization

### Resource Limits

```bash
# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=512"

# Or in PM2 ecosystem.config.js:
max_memory_restart: '512M'
```

### Database Optimization

The bot uses a JSON cache file. For better performance with many servers:
- **Keep .music-cache.json under 10MB** (auto-limited to 5000 entries)
- **Cache entries expire after 7 days** (automatic cleanup)
- **Garbage collection runs every 5 minutes**

### Network Optimization

- **Use a VPS with good network** (low latency to Discord)
- **Ensure sufficient bandwidth** for continuous streaming
- **Consider CDN for static assets** if scaling horizontally

## 7. Security Best Practices

### Secrets Management

```bash
# Option 1: Use environment variables only (recommended)
export DISCORD_TOKEN="your_token"
node launcher.js

# Option 2: Use .env but never commit it
echo .env >> .gitignore

# Option 3: Use secret management system
# Azure: az keyvault secret set
# AWS: aws secretsmanager put-secret
# etc.
```

### Firewall & Network

```bash
# UFW (Ubuntu firewall)
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
# Note: Bot doesn't need inbound ports (uses Discord websocket)
```

### Updates & Patching

```bash
# Check for security updates
npm audit

# Update dependencies
npm update

# Restart bot
pm2 restart kp-music
```

## 8. Troubleshooting Production Issues

### Bot keeps restarting
- Check logs: `pm2 logs kp-music`
- Verify credentials in .env
- Check memory usage: `pm2 monit`

### Memory leak suspicions
- Monitor with: `node --expose-gc launcher.js`
- Check cache size: `.music-cache.json` file size
- Verify GC runs every 5 minutes in logs

### Network connectivity issues
- Check Discord API status
- Verify bot permissions in guilds
- Test internet connectivity: `ping 1.1.1.1`

### High CPU usage
- Reduce search timeouts if needed
- Limit simultaneous operations
- Monitor with: `ps aux | grep node`

## 9. Scaling Horizontally

For multiple Discord servers or high load:

```bash
# Using PM2 clusters (not recommended for Discord bot)
# Discord bot should run as single instance only

# Alternative: Run multiple instances with different intents
# (Advanced topic - see Discord.js documentation)
```

## 10. Production Checklist

- [ ] Node.js 20.x LTS installed
- [ ] All npm dependencies installed
- [ ] .env file configured with all credentials
- [ ] Discord bot permissions verified
- [ ] YouTube API key tested (if using)
- [ ] Spotify credentials tested (if using)
- [ ] PM2/systemd/nssm configured
- [ ] Log rotation configured
- [ ] Backup script created
- [ ] Monitoring configured
- [ ] Firewall rules set
- [ ] SSL certificates updated (if needed)
- [ ] Database backups verified
- [ ] Bot tested in main Discord guild
- [ ] Performance baseline established

## Support & Maintenance

- **Check logs regularly**: `pm2 logs kp-music`
- **Monitor memory**: `pm2 monit`
- **Update dependencies**: `npm update monthly`
- **Review audit reports**: `npm audit` monthly
- **Test bot regularly**: Use test commands in a private channel

---

**Ready for deployment!** Your bot is now production-ready and can run 24/7 with proper monitoring and maintenance.
