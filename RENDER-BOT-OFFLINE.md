# ⚡ QUICK FIX - Bot Offline en Render

## El Problema
Bot desplegado en Render pero está **Offline** en Discord.

## La Solución (2 minutos)

### 1️⃣ Verificar Token en Render

**En Render Dashboard:**
- URL: https://dashboard.render.com
- Selecciona `kp-music-bot`
- Pestaña `Environment`
- ¿Ves `DISCORD_TOKEN`? 

**Si NO:** Agrégalo:
1. Click `Add Environment Variable`
2. Key: `DISCORD_TOKEN`
3. Value: Tu token de Discord (ver abajo)
4. Save

### 2️⃣ Obtener Token de Discord

1. Ve a https://discord.com/developers/applications
2. Selecciona tu bot
3. Panel izquierdo → **Bot**
4. Botón **Reset Token** → **Copy**
5. Pega en Render

### 3️⃣ Redeploy

**En Render:**
- Click **Manual Deploy** (arriba a la derecha)
- Espera 2-3 minutos

---

## ✅ Verificar que Funciona

**En los logs de Render (Logs tab):**

Deberías ver:
```
✓ DISCORD_TOKEN: MTQ3NDQzMTg5ND...
🤖 Intentando conectar a Discord...
✓ BotName#1234 | Prefijo: ! | 13 comandos
```

**En Discord:**
Tu bot debe aparecer **Online** ✅

---

## 🆘 Si todavía offline

1. Abre Render Logs
2. Copia el error exacto
3. Compáralo con [BOT-OFFLINE-SOLUTION.md](./BOT-OFFLINE-SOLUTION.md)

---

**¿Tienes el token?** Empieza con Paso 1 arriba.
