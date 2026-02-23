# ✅ CHECKLIST FINAL: Deploy Render - Paso a Paso

## 🎯 Estado Actual

✅ **COMPLETADO:**
- [x] Código actualizado (dotenv cargado en launcher.js)
- [x] render.yaml simplificado (sin Nix)
- [x] Cambios commiteados a GitHub
- [x] Variables locales funcionando perfectamente

⏳ **PENDIENTE (Manual en Render):**
- [ ] Configurar variables de entorno en Render Dashboard
- [ ] Re-deploy del servicio
- [ ] Verificar en logs

---

## 🚀 Paso 1: Preparar Variables para Copiar

```bash
# Ejecuta este comando para ver todas tus variables formateadas:
node setup-render-env.js
```

**Output esperado:**
```
✓ DISCORD_TOKEN             = MTQ3NDQzMT…[ENMASCARADO]
✓ CLIENT_ID                 = [ENMASCARADO]
✓ CLIENT_SECRET             = [ENMASCARADO]
✓ SPOTIFY_CLIENT_ID         = [ENMASCARADO]
✓ SPOTIFY_CLIENT_SECRET     = [ENMASCARADO]
✓ YOUTUBE_API_KEY           = [ENMASCARADO]
✓ USER_ID                   = [ENMASCARADO]
```

---

## 🌐 Paso 2: Ir a Render Dashboard

1. Abre → https://dashboard.render.com
2. Haz login con tu cuenta
3. Selecciona tu servicio **`kp-music-bot`**

---

## 📝 Paso 3: Configurar Variables de Entorno

### En la página del servicio:

1. **Busca el botón "Environment"** en la esquina superior derecha
2. Haz clic en **"Add Environment Variable"**
3. Para CADA variable (ver tabla abajo), añade:
   - **Key:** (de la columna izquierda)
   - **Value:** (de la columna derecha)
   - Haz clic en **"Add"**

### Tabla de Variables a Configurar:

**🔴 REQUERIDAS (OBLIGATORIO):**

| Key | Value |
|-----|-------|
| `DISCORD_TOKEN` | *Tu token de Discord* |
| `CLIENT_ID` | *Tu Client ID* |
| `CLIENT_SECRET` | *Tu Client Secret* |

**🟢 OPCIONALES (si quieres Spotify/YouTube):**

| Key | Value |
|-----|-------|
| `SPOTIFY_CLIENT_ID` | *Tu Spotify Client ID* |
| `SPOTIFY_CLIENT_SECRET` | *Tu Spotify Client Secret* |
| `YOUTUBE_API_KEY` | *Tu YouTube API Key* |
| `USER_ID` | *Tu Discord User ID* |

**🔵 YA PRECONFIGURADAS (NO MODIFICAR):**
```
NODE_ENV = production
NODE_OPTIONS = --max-old-space-size=512
PREFIX = !
PLAYLIST_LIMIT = 30
YTDLP_PATH = yt-dlp
```

---

## 🔄 Paso 4: Re-Deploy

Después de guardar las variables:

1. **Ve a la sección "Deploys"** en el menú lateral
2. Busca el commit `fix: Load dotenv before env checks...`
3. Haz clic en el menú **⋮** (tres puntos)
4. Selecciona **"Manual Deploy"** o **"Deploy"**
5. Espera a que aparezca "Deploy in progress..."

---

## ⏱️ Paso 5: Esperar Deployment

El deployment tarda **2-3 minutos** aproximadamente.

Durante este tiempo verás:
1. **"Building..."** - Instalando dependencias
2. **"Building (11/15 running)"** - Compilando
3. **"Live"** - ✅ Deploy completado

---

## 📊 Paso 6: Verificar en Logs

Una vez que dice **"Live"**:

1. **Abre la pestaña "Logs"** en el menú del servicio
2. **Espera a que aparezcan nuevos logs** (puede tardar 10-20 segundos)
3. **Busca estas líneas:**

```
✓ DISCORD_TOKEN: MTQ3NDQzMT...SgB0
✓ PREFIX: !
✓ Spotify listo
✓ Kp-Music#5623 | 35 comandos
✓ Bot ready for requests
```

### ✅ Si ves esto = **¡FUNCIONANDO!**

### ❌ Si ves errores:

**Error: "DISCORD_TOKEN: NO CONFIGURADO"**
- → Recargaste la página? Las variables a veces tardan en propagarse
- → Re-deploy manualmente

**Error: "invalid_token"**
- → El token expiró o es inválido
- → Regenera: Discord Developers → Bot → "Reset Token"
- → Actualiza en Render

**Error: "EADDRINUSE :::3000"**
- → Puerto en uso (normal en local)
- → En Render debería funcionar automáticamente

---

## 🔐 Paso 7: IMPORTANTE - Regenerar Tokens

⚠️ **Tus secretos están en GitHub** (en variables de Render, no en el código)

Para máxima seguridad, regenera estos tokens:

### Discord Token
1. Ve a https://discord.com/developers/applications
2. Selecciona tu app
3. Ve a **"Bot"** → **"Reset Token"**
4. Copia el nuevo token
5. Actualiza en Render → Re-deploy

### Spotify Credentials
1. Ve a https://developer.spotify.com/dashboard
2. Abre tu aplicación
3. Regenera las credenciales
4. Actualiza en Render

### YouTube API Key
1. Ve a https://console.cloud.google.com
2. Regenera la API key
3. Actualiza en Render

---

## 📋 Checklist Final

- [ ] Ejecuté `node setup-render-env.js` para ver variables
- [ ] Fui a Render Dashboard
- [ ] Abrí la sección "Environment"
- [ ] Añadí las 3 variables REQUERIDAS (DISCORD_TOKEN, CLIENT_ID, CLIENT_SECRET)
- [ ] Opcionalmente añadí Spotify, YouTube y USER_ID
- [ ] Guardé los cambios
- [ ] Hice Manual Deploy
- [ ] Esperé 2-3 minutos
- [ ] Abrí Logs y veo ✓ DISCORD_TOKEN
- [ ] Regeneré tokens en Discord/Spotify/YouTube (opcional pero recomendado)

---

## 🎉 ¡Listo!

Si completaste todos los pasos y ves el bot online:

```
✓ Kp-Music#5623 | Prefijo: ! | 35 comandos
✓ Bot ready for requests
🌐 Health check server listening on port 3000
```

### ¡Tu bot está funcionando en Render! 🚀

---

## 🆘 Troubleshooting

### El bot se desconecta constantemente
→ Aumentar memoria en render.yaml: `NODE_OPTIONS=--max-old-space-size=1024`

### Los comandos no funcionan
→ Asegúrate que el bot tiene permisos en el servidor
→ Verifica que es un slash command o prefix command (!) correcto

### Logs vacíos
→ A veces tarda en conectarse, espera 10 segundos más
→ Haz clic en "Refresh" en la sección de Logs

### El health check falla
→ Revisa que el bot esté efectivamente connected a Discord
→ Los logs deberían mostrar "READY"

---

## 📚 Referencias Útiles

- **Render Docs:** https://render.com/docs
- **Discord.js Guide:** https://guide.discordjs.org
- **Deploy Status:** https://dashboard.render.com
- **Logs en Vivo:** Dashboard → tu-servicio → Logs

---

**Última actualización:** 2026-02-23
**Versión del bot:** 4.0.0
