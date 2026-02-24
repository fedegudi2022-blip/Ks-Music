# Kp-Music Bot

Discord music bot con DisTube, yt-dlp y Spotify.

## Requisitos

- Node.js 20+
- Discord Bot Token
- FFmpeg
- YouTube Cookies (para yt-dlp)
- Spotify API (opcional)

## Local Setup

```bash
npm install
npm run dev
```

## Deploy en Render

1. Configura `DISCORD_TOKEN` en Render
2. Configura `YT_COOKIES` en Render (base64 encoded cookies)
3. Usa `npm start` como comando
4. Debería funcionar automáticamente

## Comandos

Escribe `!help` en Discord para ver todos los comandos

### Principales

- `!p text` / `!play text` - Reproducir canción/playlist
- `!stop` - Parar música
- `!skip` - Siguiente canción
- `!pause` / `!resume` - Pausar/Reanudar
- `!queue` - Ver cola
- `!volume N` - Cambiar volumen (0-100)
- `!loop` - Cambiar modo repetición
- `!shuffle` - Mezclar cola

## Configurar Cookies YouTube

Las cookies son necesarias para yt-dlp. En Render:

1. Exporta cookies desde navegador (extension "Get cookies.txt")
2. Codifica en base64
3. Pega en variable de entorno `YT_COOKIES`
