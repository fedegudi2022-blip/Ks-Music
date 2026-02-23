# 📋 Paso 1: Preparar Variables en Render

Antes de crear el Web Service en Render, ten a mano estos valores:

## Variables de Entorno (copia de tu .env)

```
DISCORD_TOKEN = [Tu token del bot]
SPOTIFY_CLIENT_ID = [Tu Spotify ID]
SPOTIFY_CLIENT_SECRET = [Tu Spotify secret]
YOUTUBE_API_KEY = [Tu YouTube API key]
PREFIX = !
PLAYLIST_LIMIT = 30
NODE_ENV = production
PORT = 3000
```

---

# 📋 Paso 2: Crear Web Service en Render

## A. Ir a render.com
1. [render.com](https://render.com) → Sign up con GitHub
2. Dashboard → **New+** → **Web Service**

## B. Conectar GitHub
1. Clic en **"Connect GitHub"**
2. Buscar y seleccionar `Kp-Music`
3. Clic en **"Connect"**

## C. Configurar
En la pantalla de creación:

```
Name: kp-music-bot
Environment: Node
Region: Frankfurt (Europe) ← Baja latencia
Branch: main
```

## D. Build & Start
```
Build Command: npm install
Start Command: node launcher.js
```

## E. Environment Variables
En la sección **Environment**, agregar:

| Key | Value |
|-----|-------|
| DISCORD_TOKEN | Tu token |
| PREFIX | ! |
| SPOTIFY_CLIENT_ID | Tu ID |
| SPOTIFY_CLIENT_SECRET | Tu secret |
| YOUTUBE_API_KEY | Tu key |
| PLAYLIST_LIMIT | 30 |
| NODE_ENV | production |
| PORT | 3000 |

## F. Plan
Seleccionar: **Starter ($7/mes)** para 24/7 real

## G. Crear
Clic en **"Create Web Service"** y esperar ~3-5 minutos

---

# ✅ Verificación

Después del build:

1. **En Render Logs** (debe aparecer):
```
✓ Kp-Music#5623 | Prefijo: ! | 35 comandos
⚡ Health server running on :3000
```

2. **Health Check**:
```bash
curl https://kp-music-bot.onrender.com/health
```

3. **En Discord**:
Bot debe estar Online ✓

---

**¿Necesitas ayuda en algún paso? Avísame**
