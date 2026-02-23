# ✅ Pre-Deploy Checklist

Realiza esta lista ANTES de deployar a Render o cualquier host en la nube.

## 📋 Verificación Local

### 1. Bot inicia sin errores
```bash
npm install
node launcher.js
```

Deberías ver:
```
✓ Kp-Music#5623 | Prefijo: ! | 35 comandos
⚡ Cache warming...
```

**Status**: ✅ / ❌

---

### 2. Health Check funciona
En otra terminal:
```bash
curl http://localhost:3000/health
```

Deberías ver JSON:
```json
{
  "status": "ok",
  "bot": "ready",
  "uptime": 5.234,
  "memory": {...}
}
```

**Status**: ✅ / ❌

---

### 3. Variables de entorno correctas
```bash
# Verifica que .env existe
test -f .env && echo "✓ .env encontrado" || echo "✗ .env falta"

# Verifica que tiene valores críticos
grep "DISCORD_TOKEN" .env && echo "✓ Discord token" || echo "✗ Falta token"
grep "SPOTIFY_CLIENT_ID" .env && echo "✓ Spotify ID" || echo "✗ Falta Spotify"
grep "YOUTUBE_API_KEY" .env && echo "✓ YouTube API" || echo "✗ Falta YouTube"
```

**Status**: ✅ / ❌

---

### 4. Bot responde a comandos
En Discord:
```
!help              → Ver lista comandos
!play Test Song    → Reproducir canción
!volume 50         → Ajustar volumen
```

**Status**: ✅ / ❌

---

### 5. .env NO está en git
```bash
git check-ignore .env && echo "✓ .env ignorado" || echo "✗ .env visible en git"
```

**Status**: ✅ / ❌

---

## 🐳 Docker Verification (Opcional)

### 1. Build Docker image
```bash
docker build -t kp-music:latest .
```

Debería terminar con:
```
Successfully tagged kp-music:latest
```

**Status**: ✅ / ❌

---

### 2. Run con docker-compose
```bash
docker-compose up -d
sleep 3
```

---

### 3. Verificar health check
```bash
curl http://localhost:3000/health
```

**Status**: ✅ / ❌

---

### 4. Ver logs
```bash
docker-compose logs -f
```

Debería mostrar:
```
kp-music    | ✓ Kp-Music#5623 ready
kp-music    | ⚡ Health server on :3000
```

**Status**: ✅ / ❌

---

### 5. Limpiar
```bash
docker-compose down
```

---

## 🔒 Seguridad

### 1. git no expone secrets
```bash
git log -p | grep "DISCORD_TOKEN" && echo "⚠️ TOKEN en histórico" || echo "✓ Token seguro"
```

**Status**: ✅ / ❌

---

### 2. .env en .gitignore
```bash
grep ".env" .gitignore && echo "✓ .env ignorado" || echo "✗ Agregar .env a .gitignore"
```

**Status**: ✅ / ❌

---

### 3. node_modules no versionado
```bash
grep "node_modules" .gitignore && echo "✓ node_modules ignorado" || echo "✗ node_modules visible"
```

**Status**: ✅ / ❌

---

## 📦 Dependencias

### 1. package.json completo
```bash
npm list --depth=0
```

Debería mostrar:
```
discord.js@14.18.0
distube@5.0.8
dotenv@16.4.5
...
```

**Status**: ✅ / ❌

---

### 2. npm audit limpio
```bash
npm audit
```

Debería mostrar:
```
added XXX packages in Xm
0 vulnerabilities
```

**Status**: ✅ / ❌

---

## 🎯 GitHub Ready

### 1. Último commit
```bash
git log -1 --oneline
```

**Status**: ✅ / ❌

---

### 2. Cambios pendientes
```bash
git status
```

Debería mostrar:
```
On branch main
nothing to commit, working tree clean
```

**Status**: ✅ / ❌

---

### 3. README.md existe
```bash
test -f README.md && echo "✓ README.md encontrado" || echo "✗ README.md falta"
```

**Status**: ✅ / ❌

---

## 🚀 Pre-Deploy Summary

**Completó todos los items?**

- [ ] ✓ Bot inicia sin errores
- [ ] ✓ Health check responde
- [ ] ✓ .env tiene valores críticos
- [ ] ✓ Bot responde a comandos
- [ ] ✓ .env no está en git
- [ ] ✓ Secrets seguros
- [ ] ✓ npm audit sin vulnerabilities
- [ ] ✓ Working tree clean

**Si todo es ✓:**

Procede a deployar a Render.com siguiendo [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)

**Si algo es ❌:**

1. Revisar el error específico
2. Corregir localmente
3. Hacer nuevo commit
4. Volver a verificar
5. Una vez todo sea ✓, push a GitHub

---

## 🔧 Comandos Rápidos

```bash
# Verificar todo de una vez
echo "🤖 Bot startup..." && node launcher.js &
sleep 2
echo "🔗 Health check..." && curl http://localhost:3000/health
echo "🔐 Secrets seguro..." && git check-ignore .env
echo "📦 Dependencies..." && npm audit
echo "✅ All checks done"
```

---

**Nota**: Este checklist garantiza que tu deployment a Render será exitoso.
