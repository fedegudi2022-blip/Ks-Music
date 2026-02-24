const { EmbedBuilder } = require("discord.js");
const { PLAYLIST_LIMIT } = require("../resolver");

// ── COLA DE REQUESTS POR GUILD ────────────────────────────────────────────────
const playQueues = new Map();
function enqueue(guildId, fn) {
  const current = playQueues.get(guildId) ?? Promise.resolve();
  const next = current.then(fn).catch(() => {});
  playQueues.set(guildId, next);
  next.finally(() => { if (playQueues.get(guildId) === next) playQueues.delete(guildId); });
  return next;
}

// ── TIEMPO ESTIMADO ───────────────────────────────────────────────────────────
function estimatedTime(input, hasYtApiKey) {
  if (/[?&]list=/.test(input) || /open\.spotify\.com\/(playlist|album)/.test(input)) return hasYtApiKey ? "~5-10s" : "~15-30s";
  if (/^https?:\/\//.test(input)) return "~2-4s";
  if (/open\.spotify\.com/.test(input)) return "~3-6s";
  return hasYtApiKey ? "~1-2s" : "~5-10s";
}

// ── DETECTAR DUPLICADO EN COLA ────────────────────────────────────────────────
function findDuplicate(queue, url, name) {
  if (!queue?.songs?.length) return null;
  // Buscar por URL exacta
  const byUrl = queue.songs.find(s => s.url === url);
  if (byUrl) return byUrl;
  // Buscar por nombre similar (sin distinción de mayúsculas)
  if (name) {
    const norm = n => n.toLowerCase().replace(/[^a-z0-9]/g, "");
    const byName = queue.songs.find(s => norm(s.name) === norm(name));
    if (byName) return byName;
  }
  return null;
}

// ── CONTAR CANCIONES DEL USUARIO EN COLA ─────────────────────────────────────
function countUserSongs(queue, userId) {
  if (!queue?.songs?.length) return 0;
  // songs[0] es la que está reproduciendo, no contarla
  return queue.songs.slice(1).filter(s => s.member?.id === userId).length;
}

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Reproduce una canción, video o playlist",
  async execute(message, args, client) {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel)
      return message.reply({ embeds: [client.embedError("Tenés que estar en un canal de voz.")] });

    const botVoice = message.guild.members.me?.voice?.channel;
    if (botVoice && botVoice.id !== voiceChannel.id)
      return message.reply({ embeds: [client.embedError("Ya estoy en otro canal de voz.")] });

    const input = args.join(" ").trim();
    if (!input) {
      const P = process.env.PREFIX || "!";
      return message.reply({
        embeds: [client.embedInfo(
          "¿Qué querés escuchar?",
          `**Uso:** \`${P}play <nombre, URL de YouTube o Spotify>\`\n\n` +
          `**Ejemplos:**\n\`${P}play despacito\`\n\`${P}play https://youtu.be/...\`\n` +
          `\`${P}play https://open.spotify.com/track/...\`\n\`${P}play https://youtube.com/playlist?list=...\``
        )],
      });
    }

    const guildId = message.guild.id;

    // Verificar saturación de cola
    const queueDepth = playQueues.has(guildId) ? 1 : 0;
    if (queueDepth > 3)
      return message.reply({
        embeds: [new EmbedBuilder().setColor(client.COLOR.WARN)
          .setDescription("⏳ Hay muchas canciones cargando. Esperá un momento.")
        ],
      });

    enqueue(guildId, () => _doPlay(message, client, voiceChannel, input, guildId));
  },
};

async function _doPlay(message, client, voiceChannel, input, guildId) {
  const hasYtApi   = !!process.env.YOUTUBE_API_KEY;
  const searchName = input.length > 60 ? input.slice(0, 57) + "…" : input;
  const eta        = estimatedTime(input, hasYtApi);

  const statusMsg = await message.channel.send({
    embeds: [new EmbedBuilder().setColor(0x2B2D31)
      .setDescription(`🔍 Buscando **${searchName}**…  \`${eta}\``)
    ],
  }).catch(() => null);

  const deleteStatus = () => statusMsg?.delete().catch(() => {});
  const editStatus   = (text, color = 0x2B2D31) =>
    statusMsg?.edit({ embeds: [new EmbedBuilder().setColor(color).setDescription(text)] }).catch(() => {});

  let resolved;
  try {
    // Timeout reducido a 20s ya que las búsquedas son más rápidas
    resolved = await Promise.race([
      client.resolveQuery(input),
      new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout de búsqueda (20s)")), 20_000)),
    ]);
  } catch (err) {
    await editStatus(`**✗** ${err.message}. Intentá de nuevo.`, client.COLOR.ERROR);
    setTimeout(deleteStatus, 5_000); // Más rápido
    return;
  }

  if (!resolved) {
    await editStatus(`**✗** No encontré nada para: **${searchName}**`, client.COLOR.ERROR);
    setTimeout(deleteStatus, 5_000);
    return;
  }

  await deleteStatus();

  // ── Canción individual ──────────────────────────────────────────────────
  if (resolved.type === "single") {
    const queue = client.distube.getQueue(message);

    // ── Verificar duplicado en cola ──────────────────────────────────────
    if (queue?.songs?.length > 0) {
      const dup = findDuplicate(queue, resolved.url, resolved.name);
      if (dup) {
        const pos = queue.songs.indexOf(dup);
        const posLabel = pos === 0 ? "reproduciendo ahora" : `posición #${pos}`;
        return message.channel.send({
          embeds: [new EmbedBuilder()
            .setColor(client.COLOR.WARN)
            .setDescription(
              `⚠️ **[${dup.name.length > 55 ? dup.name.slice(0, 52) + "…" : dup.name}](${dup.url})** ya está en la cola (${posLabel}).\n` +
              `¿Querés agregarla igual? Usá \`!play ${input} --force\``
            )
          ],
        }).catch(() => {});
      }

      // ── Verificar límite por usuario ─────────────────────────────────
      const limit  = client.USER_QUEUE_LIMIT;
      const count  = countUserSongs(queue, message.member.id);
      if (count >= limit) {
        return message.channel.send({
          embeds: [client.embedError(`Tenés **${count}/${limit}** canciones en la cola. Esperá que se reproduzcan algunas.`)],
        }).catch(() => {});
      }
    }

    // Verificar si se usa --force para ignorar duplicado
    const force = input.endsWith("--force");

    try {
      await client.distube.play(voiceChannel, resolved.url, {
        message, textChannel: message.channel, member: message.member,
      });
      // Pre-fetch siguiente si existe
      const q = client.distube.getQueue(message);
      if (q?.songs[1]) client.prefetch(q.songs[1].name).catch(() => {});
    } catch (err) {
      const errMsg = err.message?.toLowerCase() ?? '';
      console.error("PLAY error:", err.message);
      
      // Detectar tipo de error
      const isAuthError = /sign in|not a bot|403|401|auth/i.test(err.message);
      const isNetError = /network|timeout|econnreset|etimedout|503|502/i.test(err.message);
      const isNotFound = /not(?:\s+|_)found|404|missing|removed/i.test(err.message);
      
      let userMsg = "No pude reproducir eso";
      
      if (isAuthError) {
        userMsg = "YouTube requiere autenticación (actualiza las cookies)";
      } else if (isNetError) {
        userMsg = "Error de conexión, reintentando…";
      } else if (isNotFound) {
        userMsg = "La canción no existe o fue removida";
      }
      
      if (isNetError) {
        await message.channel.send({
          embeds: [new EmbedBuilder().setColor(client.COLOR.WARN).setDescription(`⚠️ ${userMsg}`)],
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 3_000)).catch(() => {});
        try {
          await client.distube.play(voiceChannel, resolved.url, {
            message, textChannel: message.channel, member: message.member,
          });
        } catch (err2) {
          const msg2 = err2.message?.toLowerCase() ?? '';
          const msgUser = msg2.includes('auth') ? 
            "YouTube requiere autenticación" : 
            "No pude reproducir";
          message.channel.send({ embeds: [client.embedError(`❌ ${msgUser}`)] }).catch(() => {});
        }
      } else {
        message.channel.send({ embeds: [client.embedError(`❌ ${userMsg}`)] }).catch(() => {});
      }
    }
    return;
  }

  // ── Playlist YouTube ────────────────────────────────────────────────────
  if (resolved.type === "yt-playlist-limited") {
    const { urls, count, name, thumbnail } = resolved;
    client.silentAdd.add(guildId);

    const loadMsg = await message.channel.send({
      embeds: [new EmbedBuilder().setColor(client.COLOR.WARN)
        .setDescription(`📋 **${name ?? "Playlist de YouTube"}**\nCargando **${count}** canciones… \`0/${count}\``)
        .setThumbnail(thumbnail ?? null)
      ],
    }).catch(() => null);

    let queued = 0;
    // Cargar playlists en paralelo por lotes
    const BATCH_SIZE = 5;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(url =>
        client.distube.play(voiceChannel, url, { message, textChannel: message.channel, member: message.member })
          .then(() => { queued++; })
          .catch(() => {})
      ));
      
      if (queued > 0 && (queued % 3 === 0 || i + BATCH_SIZE >= urls.length)) {
        loadMsg?.edit({ embeds: [new EmbedBuilder().setColor(client.COLOR.WARN)
          .setDescription(`📋 **${name ?? "Playlist de YouTube"}**\nCargando… \`${queued}/${count}\``)
          .setThumbnail(thumbnail ?? null)
        ]}).catch(() => {});
      }
    }

    client.silentAdd.delete(guildId);
    loadMsg?.edit({ embeds: [new EmbedBuilder()
      .setColor(queued > 0 ? client.COLOR.ACCENT : client.COLOR.ERROR)
      .setDescription(queued > 0 ? `✅ **${name ?? "Playlist"}** — **${queued}** canciones en cola` : "**✗** No se pudo cargar ninguna canción.")
      .setThumbnail(thumbnail ?? null)
    ]}).catch(() => {});
    return;
  }

  // ── Playlist Spotify ────────────────────────────────────────────────────
  if (resolved.type === "spotify-playlist-limited") {
    const { tracks, count, name, thumbnail } = resolved;
    client.silentAdd.add(guildId);

    const loadMsg = await message.channel.send({
      embeds: [new EmbedBuilder().setColor(0x1DB954)
        .setDescription(`📋 **${name ?? "Playlist de Spotify"}**\nBuscando **${count}** canciones… \`0/${count}\``)
        .setThumbnail(thumbnail ?? null)
      ],
    }).catch(() => null);

    const BATCH = 4; // Aumentado de 3 para paralismo más agresivo
    let queued = 0;
    for (let i = 0; i < tracks.length; i += BATCH) {
      await Promise.all(tracks.slice(i, i + BATCH).map(track =>
        client.distube.play(voiceChannel, `ytsearch:${track}`, {
          message, textChannel: message.channel, member: message.member,
        }).then(() => { queued++; }).catch(() => {})
      ));
      if (queued > 0 && (queued % 4 === 0 || i + BATCH >= tracks.length)) {
        loadMsg?.edit({ embeds: [new EmbedBuilder().setColor(0x1DB954)
          .setDescription(`📋 **${name ?? "Playlist de Spotify"}**\nBuscando… \`${queued}/${count}\``)
          .setThumbnail(thumbnail ?? null)
        ]}).catch(() => {});
      }
    }

    client.silentAdd.delete(guildId);
    loadMsg?.edit({ embeds: [new EmbedBuilder()
      .setColor(queued > 0 ? 0x1DB954 : client.COLOR.ERROR)
      .setDescription(queued > 0 ? `✅ **${name ?? "Spotify"}** — **${queued}** canciones en cola` : "**✗** No se pudo cargar la playlist.")
      .setThumbnail(thumbnail ?? null)
    ]}).catch(() => {});
    return;
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  try {
    await client.distube.play(voiceChannel, resolved.url ?? input, {
      message, textChannel: message.channel, member: message.member,
    });
  } catch (err) {
    console.error("PLAY fallback error:", err.message);
    message.channel.send({ embeds: [client.embedError(err.message)] });
  }
}