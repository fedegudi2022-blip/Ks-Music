# 🚀 Deploy en Render.com (Guía Completa)

## Opción 1: Auto-Deploy desde GitHub (RECOMENDADO)

### Paso 1: Preparar el repositorio
```bash
# Tu repo ya tiene:
- render.yaml ✓
- Dockerfile ✓
- shell.nix ✓
- flake.nix ✓
```

### Paso 2: Crear servicio en Render

1. Ve a [render.com](https://render.com)
2. **Sign up** con GitHub
3. C Clic en **"New"** → **"Web Service"**
4. Conectar GitHub → Seleccionar repo `Kp-Music`
5. Configurar:

```
Name: kp-music-bot
Environment: Node
Build Command: npm install
Start Command: node launcher.js
Branch: main
Plan: Starter ($7/mes) o Starter+ ($12/mes)
```

### Paso 3: Agregar variables de entorno

En Render Dashboard → **Environment** → Add Variable:

```
DISCORD_TOKEN = MTQ3NDQzMTg5NDMzNzc1MzI2Mg.GSYopI.j4dwm8U...
PREFIX = !
SPOTIFY_CLIENT_ID = eec99b0819a04a77940e002a54a030cd
SPOTIFY_CLIENT_SECRET = cc47b097877049289b37a4fbcdf09968
YOUTUBE_API_KEY = AIzaSyCjIEb9DNDjcD-cdS3gpKE72qsFKtt6AaA
PLAYLIST_LIMIT = 30
NODE_ENV = production
```

### Paso 4: Deploy

Haz click en **"Create Web Service"**

Render automáticamente:
- ✅ Clona tu repo
- ✅ Instala dependencias (`npm install`)
- ✅ Ejecuta `node launcher.js`
- ✅ Mantiene 24/7 activo
- ✅ Auto-redeploy en cada push a main

---

## Opción 2: Usar Dockerfile personalizado

Si quieres máximo control:

### Paso 1: En Render, selecciona:
```
Environment: Docker
Dockerfile: ./Dockerfile
```

### Paso 2: El resto igual

---

## Opción 3: Usar Nix (Experimental)

```
Build Command: nix develop -c npm install
Start Command: nix develop -c node launcher.js
```

---

## ✅ Verificar Deploy

Después de crear el servicio:

1. **Esperar ~2-5 minutos** mientras instala dependencias
2. Ver logs en tiempo real en Render Dashboard
3. Buscar: `✓ Kp-Music#5623 | Prefijo: ! | 35 comandos`

### Health Check

Tu bot ahora tiene endpoints HTTP:
- `https://kp-music-bot.onrender.com/health` → Health check (JSON)
- `https://kp-music-bot.onrender.com/stats` → Estadísticas
- `https://kp-music-bot.onrender.com/` → Dashboard web

---

## 🔧 Troubleshooting

### Bot no inicia
```
Error: Cannot find module 'discord.js'
```
**Solución:** Render ejecutó `npm ci` en lugar de `npm install`
- Ir a Dashboard → Settings → Clear build cache
- Hacer un nuevo push

### Bot se duerme en plan gratis
```
Error: Bot disconnected from Discord
```
**Solución:** Actualizar a Starter Plan ($7/mes) para 24/7 real

### Memoria llena
```
Error: FATAL: JavaScript heap out of memory
```
**Solución:** En package.json, verificar:
```json
"start": "NODE_OPTIONS='--max-old-space-size=512' node launcher.js"
```

### Variables de entorno no cargan
1. Verificar en Render Dashboard → Environment
2. Hacer un redeploy: Clic en "Manual Deploy"

---

## 📊 Plans en Render

| Plan | Precio | Features |
|------|--------|----------|
| **Starter** | $7/mes | 24/7, 512MB RAM, Auto-deploy ⭐ |
| **Starter +** | $12/mes | 24/7, 1GB RAM, Mejor CPU |
| **Free** | $0 | Duerme cada 15 min, sin 24/7 |

---

## 🔄 Auto-Deploy

Cada vez que hagas push:
```bash
git add .
git commit -m "Update bot code"
git push origin main
```

Render automáticamente:
1. Detecta cambios
2. Instala dependencias
3. Ejecuta launcher.js
4. Redeploy en ~2-3 minutos

---

## 📈 Monitorear Logs

En Render Dashboard → Logs:
```
✓ Kp-Music#5623 | Prefijo: ! | 35 comandos
⚡ Cache: 42 entradas
```

---

## 🎯 Resumen Rápido

```bash
# 1. Push a GitHub
git push origin main

# 2. En Render: New → Web Service → GitHub repo

# 3. Build: npm install
# Start: node launcher.js

# 4. Add Environment variables (DISCORD_TOKEN, etc.)

# 5. Create Web Service

# 6. Listo! ✅ Bot running 24/7
```

---

**¿Necesitas ayuda? Checa los logs en Render Dashboard o abre un issue en GitHub**
