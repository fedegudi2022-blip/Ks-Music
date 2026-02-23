# 🚀 Guía Completa: Deploy a Render.com

## 🔴 ¿Por Qué Dice "NO CONFIGURADO"?

Cuando ves:
```
❌ DISCORD_TOKEN: NO CONFIGURADO
❌ PREFIX: NO CONFIGURADO
```

**SIN EMBARGO** el bot SÍ se conecta exitosamente. Esto significa:
- ✅ Tu `.env` local funciona bien
- ❌ Pero Render NO tiene esas variables configuradas

**Por qué?** El archivo `.env` está en `.gitignore` (correcto para seguridad), así que Render nunca lo ve.

---

## ✅ Solución: Configurar Variables en el Dashboard de Render

### Paso 1️⃣: Acceder a Render Dashboard

1. Ve a **https://dashboard.render.com**
2. Haz clic en tu servicio **kp-music-bot**
3. En la esquina superior derecha, busca **"Environment"**

### Paso 2️⃣: Configurar Variables OBLIGATORIAS

Haz clic en **"Add Environment Variable"** y añade:

#### 🔵 DISCORD_TOKEN (OBLIGATORIO)

| Campo | Valor |
|-------|-------|
| **Key** | `DISCORD_TOKEN` |
| **Value** | Tu token de Discord Bot |

📝 **¿Cómo obtener el token?**
1. Ve a https://discord.com/developers/applications
2. Selecciona tu aplicación (o crea una nueva)
3. En el menú izquierdo, haz clic en **"Bot"**
4. Haz clic en **"Reset Token"** (o copia el existente)
5. ⚠️ **NO COMPARTAS ESTE TOKEN** - ¡Es como una contraseña!

#### 🟢 OTROS TOKENS REQUERIDOS

También añade estos:

| Variable | Dónde obtener |
|----------|------------------|
| `CLIENT_ID` | Discord Developers → General Information |
| `CLIENT_SECRET` | Discord Developers → OAuth2 → General |
| `SPOTIFY_CLIENT_ID` | https://developer.spotify.com/dashboard |
| `SPOTIFY_CLIENT_SECRET` | Mismo sitio que arriba |
| `YOUTUBE_API_KEY` | https://console.cloud.google.com |
| `USER_ID` | Tu Discord User ID (clic derecho en tu nome en Discord) |

### Paso 3️⃣: IMPORTANTE - Guardar y Re-Deploy

1. **Guarda** todas las variables
2. Render detectará el cambio y empezará un **re-deploy automático**
3. Espera ~2-3 minutos a que se complete

---

## 🔍 Verificar que Funciona

### En los Logs de Render:

1. Ve a tu servicio en Render
2. Abre la pestaña **"Logs"**
3. Busca esta línea:
   ```
   ✓ DISCORD_TOKEN: MTQ3NDQzMTg5...[ultimos-4]
   ✓ PREFIX: !
   ✓ Kp-Music#5623 | 35 comandos
   ```

Si ves esto = ✅ **¡Está funcionando!**

---

## 🆘 Troubleshooting

### ❌ Sigue diciendo "NO CONFIGURADO"

**Posibles causas y soluciones:**

1. **Token inválido o expirado**
   - Ve a Discord Developers
   - Haz clic en "Reset Token" para generar uno nuevo
   - Copia el nuevo token a Render

2. **Las variables no se guardaron**
   - Recarga la página de Render
   - Verifica que aparezcan en la lista de variables
   - Re-deploy manualmente

3. **Re-deploy no se ejecutó**
   - Ve a **Deploys**
   - Haz clic en **"Manual Deploy"**
   - Selecciona **"Deploy Latest Commit"**

### ❌ El token es inválido

Rendimiento inusual? Probablemente significa que tu token expiró o fue regenerado:
- En Discord Developers, haz clic **"Reset Token"** para generar uno nuevo
- Copia el nuevo a Render y re-deploy

### ❌ El bot no responde a comandos

1. Asegúrate que el bot está invitado al servidor
2. Verifica que tiene los permisos correctos
3. Intenta comandos en un canal donde el bot pueda escribir

---

## 📋 Checklist Pre-Deploy

- [ ] DISCORD_TOKEN configurado en Render
- [ ] CLIENT_ID configurado
- [ ] CLIENT_SECRET configurado  
- [ ] Bot invitado al servidor (con permisos)
- [ ] Re-deploy completado
- [ ] Logs muestran "✓ Bot ready for requests"

---

## 🔐 Seguridad: .env y .gitignore

**IMPORTANTE:** 

✅ **Correcto** - Tu `.env` local está en `.gitignore`, así que:
- Se protegen tus secretos localmente
- No se suben a GitHub
- Pero Render NO puede acceder a ellos

❌ **NUNCA hagas esto:**
- Subir `.env` a GitHub
- Compartir tu DISCORD_TOKEN
- Usar tokens/secretos en código fuente

---

## 🚀 Variables Preconfiguradas en Render

Estas ya están configuradas automáticamente:

```yaml
NODE_ENV=production          # Modo producción
NODE_OPTIONS=--max-old-space-size=512  # Memoria limitada
PREFIX=!                     # Prefijo de comandos
PLAYLIST_LIMIT=30            # Máximo de canciones por playlist
YTDLP_PATH=yt-dlp           # Ubicación de yt-dlp
```

**No necesitas cambiar estas** a menos que quieras un prefijo diferente.

---

## 📚 Links Útiles

- [Documentación de Render](https://render.com/docs)
- [Documentación de Discord.js](https://discord.js.org)
- [Discord Developer Portal](https://discord.com/developers)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 💡 Tips de Producción

1. **Monitorea los logs regularmente**
   - Ve a Render → Logs para ver errores

2. **Configura Health Checks**
   - Render ya lo hace en `/health`
   - El bot se reinicia si falla

3. **Auto-deploy habilitado**
   - Cada push a main hace redeploy automático

4. **Guardar logs**
   - Los logs de Render se limpian después de cierto tiempo
   - Usa un servicio como LogRocket si necesitas histórico

---

**¿Necesitas ayuda?** Revisa los logs en Render o re-ejecuta `npm run check` localmente.
