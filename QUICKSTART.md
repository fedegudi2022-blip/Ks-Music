# ⚡ Quick Start Guide

Get Kp-Music Bot running in 5 minutes.

## Step 1: Prerequisites ✓

Ensure you have:
- **Node.js 18+** → [Download](https://nodejs.org)
- **Discord Bot Token** → [Get one](https://discord.com/developers/applications)

## Step 2: Clone & Install

```bash
git clone https://github.com/yourusername/Kp-Music.git
cd Kp-Music
npm install
```

## Step 3: Configure

```bash
# Copy the template
cp .env.example .env

# Open .env and add:
# - DISCORD_TOKEN=your_token_here
```

## Step 4: Run

```bash
npm start
```

Expected output:
```
✓ Kp-Music#5623  |  Prefijo: !  |  35 comandos
```

## Step 5: Invite to Discord

Open this URL (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=36700160&scope=bot
```

## That's it! 🎉

Now use commands:
- `!play despacito` - Play a song
- `!queue` - View queue
- `!help` - Show all commands

---

### Optional: Add More Features

**YouTube API** (faster searches):
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable YouTube Data API v3
3. Create API Key credential
4. Add to .env: `YOUTUBE_API_KEY=your_key`

**Spotify** (play Spotify tracks):
1. Go to [Spotify Developer](https://developer.spotify.com/dashboard)
2. Create app → Copy credentials
3. Add to .env:
   ```
   SPOTIFY_CLIENT_ID=your_id
   SPOTIFY_CLIENT_SECRET=your_secret
   ```

---

### Troubleshooting

**Bot won't start?**
- Check Node.js version: `node -v` (needs 18+)
- Check .env has DISCORD_TOKEN

**Can't find songs?**
- Add YouTube API Key for better search
- Verify internet connection

**Not playing audio?**
- Ensure bot has permission to connect to voice
- Check FFmpeg is installed (auto-installed with npm)

---

### Commands Overview

| Command | What it does |
|---------|------------|
| `!play <song>` | Play or queue a song |
| `!pause` | Pause playback |
| `!skip` | Skip to next song |
| `!stop` | Stop and leave |
| `!queue` | Show song queue |
| `!volume <0-100>` | Set volume |
| `!help` | Show all commands |

---

### Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Read full [README.md](README.md) for complete documentation
- Check [CHANGELOG.md](CHANGELOG.md) for what's new

---

**Need help?** Check the troubleshooting section in README.md or open an issue.
