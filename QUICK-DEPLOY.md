# 🚀 Quick Deploy Guide - Kp-Music Bot

Una guía rápida para tener el bot running en Render.com en menos de 10 minutos.

---

## ⚡ TL;DR (5 minutos)

### 1. Verificar localmente
```bash
npm run check
```

Si todo es ✅, continúa.

### 2. Commit y push
```bash
git add .
git commit -m "🚀 Production ready - Nix/Docker infrastructure"
git push origin main
```

### 3. En Render.com
- Ve a [render.com](https://render.com)
- New Web Service → GitHub → `Kp-Music`
- Build: `npm install`
- Start: `node launcher.js`
- Environment: Copia de [RENDER-ENV-SETUP.md](./RENDER-ENV-SETUP.md)
- Plan: Starter ($7/mes)
- Create

### 4. Espera 2-3 minutos ⏳

### 5. Bot running 24/7 ✅

---

## 📚 Guías Detalladas

| Documento | Para... |
|-----------|---------|
| [`DEPLOY-RENDER.md`](./DEPLOY-RENDER.md) | Pasos completos + troubleshooting |
| [`RENDER-ENV-SETUP.md`](./RENDER-ENV-SETUP.md) | Copy-paste variables entorno |
| [`PRE-DEPLOY-CHECKLIST.md`](./PRE-DEPLOY-CHECKLIST.md) | Checklist manual de verificación |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Todas las opciones (Docker, Railway, Oracle, etc.) |

---

## 🛠️ Comandos disponibles

### 👟 Desarrollo
```bash
npm start          # Iniciar bot (producción)
npm run dev        # Watch mode (desarrollo)
npm run check      # Pre-deploy checklist automatizado
npm run test       # Ejecutar checks + npm audit
```

### 🐳 Docker
```bash
npm run docker:build    # Build imagen Docker
npm run docker:up       # Iniciar docker-compose
npm run docker:down     # Detener docker-compose
npm run docker:logs     # Ver logs en tiempo real
npm run docker:test     # Build + Start + Health check + Stop
```

### ⚙️ Nix (si tienes Nix instalado)
```bash
nix develop        # Entrar en shell con Node + FFmpeg
nix run .#dev      # Dev shell automático
nix run .#start    # Iniciar bot via Nix
flake.lock         # Update dependencies
```

---

## 📋 Pre-Deploy Checklist (Rápido)

```bash
# 1. Verificar todo automáticamente
npm run check

# 2. ¿Todo es ✅? Continúa. ¿Hay ❌? Fija primero.

# 3. Si todo es ✅:
git push origin main

# 4. Ir a Render.com y crear Web Service
```

---

## 🐳 Alternate: Docker Local

Si prefieres probar localmente con Docker antes de Render:

```bash
# Build imagen
npm run docker:build

# Iniciar (con docker-compose)
npm run docker:up

# Verificar health
curl http://localhost:3000/health

# Ver logs
npm run docker:logs

# Detener
npm run docker:down
```

---

## 🎯 Deployment Platforms

### ⭐ Render.com (RECOMENDADO)
- **Precio:** $7/mes (24/7)
- **Setup:** 5 minutos
- **Auto-deploy:** Automático en cada push
- **Health checks:** Incluido
- [Ir a RENDER-ENV-SETUP.md](./RENDER-ENV-SETUP.md)

### 🚀 Railway
- **Precio:** $5/mes
- **Setup:** 5 minutos
- **Auto-deploy:** Automático
- [Ir a DEPLOYMENT.md](./DEPLOYMENT.md#railway)

### 💻 Oracle Always Free
- **Precio:** $0 (permanente)
- **Setup:** 20 minutos
- **Requiere:** Docker + Docker Compose
- [Ir a DEPLOYMENT.md](./DEPLOYMENT.md#oracle)

---

## ❓ Problemas Comunes

### Bot no inicia
```bash
npm install
npm start
```

### Variables de entorno faltando
```bash
# Verificar
grep "DISCORD_TOKEN" .env

# Si no existe, crear .env con:
DISCORD_TOKEN=your_token_here
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
YOUTUBE_API_KEY=your_key
PREFIX=!
```

### .env expuesto en git
```bash
# No hay forma de "no exponerlo" si ya está en el histórico
# Mejor opción: usar secrets en Render dashboard

# Para git fresco:
git rm --cached .env
git commit -m "Remove .env from git"
```

### npm audit vulnerabilities
```bash
npm audit fix
npm install
```

---

## 📊 Monitoreo

Una vez deployed en Render:

### Dashboard
https://dashboard.render.com → Tu servicio

### Health Check
```bash
curl https://kp-music-bot.onrender.com/health
```

### Logs
En Render Dashboard → Logs (en vivo)

### Stats
```bash
curl https://kp-music-bot.onrender.com/stats
```

---

## 🎯 Flujo Completo (Paso a Paso)

**Local:**
```bash
# 1. Verificar que funciona
npm run check

# 2. Si faltaban deps
npm install

# 3. Opcional: Probar con Docker
npm run docker:test

# 4. Commit
git add .
git commit -m "🚀 Ready to deploy"
```

**GitHub:**
```bash
git push origin main
```

**Render.com:**
```
1. New Web Service
2. Connect GitHub → select Kp-Music
3. Name: kp-music-bot
4. Build: npm install
5. Start: node launcher.js
6. Add Environment Variables (DISCORD_TOKEN, etc.)
7. Plan: Starter
8. Create Web Service
9. Esperar 3-5 minutos
10. ✅ Running!
```

---

## 💡 Consejos

- **Antes de pushear:** Siempre `npm run check`
- **En Render:** Monitorear logs en primeros 5 minutos
- **Health check:** `/health` devuelve JSON del status
- **Auto-deploy:** Render redeploy automático cada push a main
- **Cache:** Bot cachea búsquedas para velocidad

---

## 📞 Soporte

Si algo no funciona:

1. Revisar [PRE-DEPLOY-CHECKLIST.md](./PRE-DEPLOY-CHECKLIST.md)
2. Revisar [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Revisar logs en Render Dashboard
4. Verificar variables de entorno

---

## 🎉 Resumen

| Paso | Tiempo | Acción |
|------|--------|--------|
| 1️⃣ | 1 min | `npm run check` |
| 2️⃣ | 1 min | `git push origin main` |
| 3️⃣ | 2 min | Crear en Render.com |
| 4️⃣ | 3-5 min | Esperar build |
| 5️⃣ | 1 min | Verificar en Discord |

**Total: ~10 minutos** ✅

---

**¿Listo? Comienza con:** `npm run check`
