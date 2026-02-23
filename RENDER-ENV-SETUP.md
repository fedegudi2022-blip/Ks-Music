# 🎯 Render.com Setup - Entorno Configurado

Copia y pega estas variables exactamente en Render.com Dashboard → Environment

## 📋 DISCORD

```
DISCORD_TOKEN=MTQ3NDQzMTg5NDMzNzc1MzI2Mg.GSYopI.j4dwm8U...
(Tu token del bot en Discord Developer Portal)
```

---

## 🎵 SPOTIFY

```
SPOTIFY_CLIENT_ID=eec99b0819a04a77940e002a54a030cd
SPOTIFY_CLIENT_SECRET=cc47b097877049289b37a4fbcdf09968
(Obtener en https://developer.spotify.com/dashboard)
```

---

## 🎥 YOUTUBE

```
YOUTUBE_API_KEY=AIzaSyCjIEb9DNDjcD-cdS3gpKE72qsFKtt6AaA
(Obtener en https://console.cloud.google.com)
```

---

## ⚙️ BOT CONFIG

```
PREFIX=!
PLAYLIST_LIMIT=30
NODE_ENV=production
PORT=3000
```

---

## 🎶 VOICE CONFIG (Opcional)

```
VOICE_BITRATE=128000
VOICE_TIMEOUT=300000
SEEK_TIMEOUT=5000
```

---

## 📝 Instrucciones para Render

### Paso 1: Nueva Web Service

1. Ve a [render.com](https://render.com)
2. **Dashboard** → **New+** → **Web Service**
3. Conecta GitHub: Selecciona repo `Kp-Music`

---

### Paso 2: Configuración Básica

```
Name: kp-music-bot
Environment: Node
Region: Frankfurt (Europe - Latency Baja) ⭐
Branch: main
```

---

### Paso 3: Build & Start

```
Build Command: npm install
Start Command: node launcher.js
```

---

### Paso 4: Environment Variables

Ir a **Environment** tab → **Add Variable** (una por una):

| Key | Value |
|-----|-------|
| `DISCORD_TOKEN` | Tu token |
| `PREFIX` | `!` |
| `SPOTIFY_CLIENT_ID` | Tu ID |
| `SPOTIFY_CLIENT_SECRET` | Tu secret |
| `YOUTUBE_API_KEY` | Tu API key |
| `PLAYLIST_LIMIT` | `30` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

**Copiar-Pegar fácil:**
```
DISCORD_TOKEN=MTQ3NDQzMTg5NDMzNzc1MzI2Mg.GSYopI.j4dwm8U
PREFIX=!
SPOTIFY_CLIENT_ID=eec99b0819a04a77940e002a54a030cd
SPOTIFY_CLIENT_SECRET=cc47b097877049289b37a4fbcdf09968
YOUTUBE_API_KEY=AIzaSyCjIEb9DNDjcD-cdS3gpKE72qsFKtt6AaA
PLAYLIST_LIMIT=30
NODE_ENV=production
PORT=3000
```

---

### Paso 5: Plan

Seleccionar Plan:

| Plan | Precio | Uptime |
|------|--------|--------|
| **Starter** | $7/mes | 24/7 ⭐ RECOMENDADO |
| **Starter+** | $12/mes | 24/7 + Mejor CPU |
| **Free** | $0 | Duerme cada 15 min ❌ |

---

### Paso 6: Crear

Click en **Create Web Service** y espera ~3-5 minutos.

---

## ✅ Verificar Deploy

Después de que termina el build:

### 1. Logs
En Render Dashboard → **Logs** (en vivo):
```
✓ Kp-Music#5623 | Prefijo: ! | 35 comandos
⚡ Cache warming...
✓ Health server running on :3000
```

### 2. Health Check
```bash
curl https://kp-music-bot.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "bot": "ready",
  "uptime": 45.234,
  "memory": {...}
}
```

### 3. En Discord
El bot debería estar **Online** en tu servidor.

Prueba:
```
!help
!play Test Song
```

---

## 🔄 Auto-Deploy

Cada vez que hagas push a `main`:

```bash
git add .
git commit -m "Update bot features"
git push origin main
```

Render automáticamente:
1. ✅ Detecta cambios
2. ✅ Clona repo
3. ✅ Instala dependencias
4. ✅ Inicia bot
5. ✅ Deploy en ~2-3 min

---

## 🛠️ Troubleshooting

### ❌ Build falló
**Error:** `Cannot find module 'discord.js'`

**Solución:**
1. Settings → Clear build cache
2. Manual Deploy

---

### ❌ Bot disconnected
**Error:** `Bot disconnected from Discord`

**Solución:**
- Estás en plan Free (duerme cada 15 min)
- Upgrade a Starter Plan ($7/mes)

---

### ❌ Memory limit exceeded
**Error:** `FATAL: JavaScript heap out of memory`

**Solución:** Aumentar memoria en plan más alto

---

### ❌ Logs están vacíos
**Solución:**
1. Esperar 1 minuto después de crear
2. Refresh logs
3. Si sigue vacío → Check build errors

---

## 📊 Monitorizar

### Métricas en Render Dashboard:
- **CPU Usage**: Debería estar <20% en reposo
- **Memory**: ~150-200MB normal
- **Requests**: Varían según uso

---

## 💰 Costos

**Render Starter Plan ($7/mes):**
- ✅ 24/7 operativo
- ✅ 512MB RAM
- ✅ 1 CPU
- ✅ Auto-redeploy
- ✅ SSL/HTTPS incluido
- ✅ Health checks

---

## 🎯 Resumido

```
1. Ir a render.com
2. New Web Service → GitHub
3. Build: npm install
4. Start: node launcher.js
5. Add Environment Variables (copiar tabla arriba)
6. Select Starter Plan
7. Create
8. Esperar 3-5 min
9. Verificar en Discord → bot Online ✅
```

---

**¡Listo! Bot running 24/7 en Render.com 🚀**
