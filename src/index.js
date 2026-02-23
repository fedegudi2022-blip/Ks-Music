// ── CARGAR PATCH DE TIMEOUT ANTES DE CUALQUIER DEPENDENCIA ──────────────────
require("./patch-setTimeout");

require("dotenv").config();

const {
  Client, GatewayIntentBits, Partials, Collection,
  EmbedBuilder, ActivityType,
} = require("discord.js");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SpotifyPlugin } = require("@distube/spotify");
const { resolve: resolveQuery, prefetch, markDead } = require("./resolver");
const fs   = require("fs");
const path = require("path");

// ── PARCHE: eliminar --no-call-home deprecado ─────────────────────────────────
const _spawn = require("child_process").spawn;
require("child_process").spawn = function(cmd, args, opts) {
  if (Array.isArray(args)) args = args.filter(a => a !== "--no-call-home");
  return _spawn(cmd, args, opts);
};

// ── ANTI-CRASH GLOBAL ─────────────────────────────────────────────────────────
process.on("uncaughtException",      err => console.error("uncaughtException:", err.message));
process.on("unhandledRejection", reason => console.error("unhandledRejection:", reason));

// ── CLIENT ───────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ── COMANDOS ─────────────────────────────────────────────────────────────────
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.name) {
      client.commands.set(cmd.name, cmd);
      if (cmd.aliases) cmd.aliases.forEach(a => client.commands.set(a, cmd));
      console.log(`  + ${cmd.name}${cmd.aliases ? ` [${cmd.aliases.join(", ")}]` : ""}`);
    }
  }
}

// ── COLORES ──────────────────────────────────────────────────────────────────
const COLOR = {
  ACCENT: 0x1DB954,
  INFO:   0x5865F2,
  WARN:   0xFAA61A,
  ERROR:  0xED4245,
  MUTED:  0x2B2D31,
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = s => {
  if (!s || isNaN(s) || s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

const volIcon = v => v === 0 ? "🔇" : v < 35 ? "🔈" : v < 70 ? "🔉" : "🔊";
const LOOP_ICON  = ["↩️", "🔂", "🔁"];
const LOOP_LABEL = ["Sin repetición", "Canción", "Cola"];

// ── EMBEDS ───────────────────────────────────────────────────────────────────
function embedNowPlaying(song, queue) {
  const inQueue = Math.max(0, queue.songs.length - 1);
  const user = song.member?.user;
  return new EmbedBuilder()
    .setColor(queue.paused ? 0x4E5058 : COLOR.ACCENT)
    .setDescription(
      `**▶ [${song.name}](${song.url})**\n` +
      `\`${song.formattedDuration}\`  ·  pedida por **${user?.username ?? "?"}**` +
      (inQueue > 0 ? `  ·  📋 ${inQueue} siguiente${inQueue !== 1 ? "s" : ""}` : "")
    );
}

function embedQueue(queue, guildName, page = 0) {
  const PER = 10;
  const start = page * PER + 1;
  const items = queue.songs.slice(start, start + PER);
  const pages = Math.max(1, Math.ceil((queue.songs.length - 1) / PER));
  const cur = queue.songs[0];
  const totalSec = queue.songs.slice(1).reduce((a, s) => a + (s.duration ?? 0), 0);
  const list = items.length
    ? items.map((s, i) => {
        const n = start + i;
        const name = s.name.length > 46 ? s.name.slice(0, 43) + "…" : s.name;
        return `\`${String(n).padStart(2)}\` [${name}](${s.url}) · \`${s.formattedDuration}\``;
      }).join("\n")
    : "*No hay más canciones*";

  return new EmbedBuilder()
    .setColor(COLOR.INFO)
    .setAuthor({ name: `📋 Cola de ${guildName}${pages > 1 ? `  ·  Página ${page + 1}/${pages}` : ""}` })
    .addFields(
      { name: "▶ Reproduciendo", value: `[${cur.name.slice(0, 50)}${cur.name.length > 50 ? "…" : ""}](${cur.url}) · \`${cur.formattedDuration}\`` },
      { name: `Siguiente${queue.songs.length > 2 ? "s" : ""}  ·  ${Math.max(0, queue.songs.length - 1)} canción(es)  ·  ${fmt(totalSec)} restante`, value: list },
    )
    .setFooter({ text: `${LOOP_ICON[queue.repeatMode]} ${LOOP_LABEL[queue.repeatMode]}  ·  ${volIcon(queue.volume)} ${queue.volume}%` });
}

const embedError   = msg    => new EmbedBuilder().setColor(COLOR.ERROR).setDescription(`**✗** ${msg}`);
const embedInfo    = (t, d) => new EmbedBuilder().setColor(COLOR.MUTED).setTitle(t).setDescription(d ?? "\u200b");
const embedSuccess = (t, d) => new EmbedBuilder().setColor(COLOR.ACCENT).setDescription(`**✓** ${d ? `**${t}** — ${d}` : t}`);

// ── HISTORIAL ─────────────────────────────────────────────────────────────────
const songHistory = new Map();
client.songHistory = songHistory;
function addToHistory(guildId, song) {
  if (!songHistory.has(guildId)) songHistory.set(guildId, []);
  const hist = songHistory.get(guildId);
  hist.push({ name: song.name, url: song.url, duration: song.formattedDuration, requestedBy: song.member?.user?.username ?? "?" });
  if (hist.length > 50) hist.shift();
}

// ── EXPONER EN CLIENT ─────────────────────────────────────────────────────────
client.resolveQuery     = resolveQuery;
client.prefetch         = prefetch;
client.markDead         = markDead;
client.embedPlay        = embedNowPlaying;
client.embedQueue       = embedQueue;
client.embedError       = embedError;
client.embedInfo        = embedInfo;
client.embedSuccess     = embedSuccess;
client.fmt              = fmt;
client.COLOR            = COLOR;
client.silentAdd        = new Set();
client.USER_QUEUE_LIMIT = parseInt(process.env.USER_QUEUE_LIMIT) || 5;

// ── DISTUBE ──────────────────────────────────────────────────────────────────
const cookieFile = path.join(process.cwd(), "cookies.txt");
const ytdlpArgs  = ["--prefer-free-formats", "--no-playlist"];
if (fs.existsSync(cookieFile)) { ytdlpArgs.push("--cookies", cookieFile); console.log("  ✓ Usando cookies.txt"); }

const ytdlpLocal      = path.join(process.cwd(), "yt-dlp.exe");
const ytdlpExecutable = fs.existsSync(ytdlpLocal) ? ytdlpLocal : undefined;
if (ytdlpExecutable) console.log(`  ✓ yt-dlp encontrado: ${ytdlpExecutable}`);

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  savePreviousSongs: true,
  plugins: [
    new SpotifyPlugin({ api: { clientId: process.env.SPOTIFY_CLIENT_ID, clientSecret: process.env.SPOTIFY_CLIENT_SECRET } }),
    new YtDlpPlugin({ update: false, ytdlpArgs, ...(ytdlpExecutable ? { executable: ytdlpExecutable } : {}) }),
  ],
});
client.distube = distube;

// ── NOW PLAYING ───────────────────────────────────────────────────────────────
const npMap = new Map();
function stopNP(guildId) { npMap.delete(guildId); }
async function sendNP(queue, song) {
  stopNP(queue.id);
  try {
    const msg = await queue.textChannel?.send({ embeds: [embedNowPlaying(song, queue)] });
    if (msg) npMap.set(queue.id, { msg });
  } catch (e) { console.error("sendNP:", e.message); }
}
function leaveVoice(queue) { try { distube.voices.get(queue.id)?.leave(); } catch {} }

// ── RETRY: buscar alternativa cuando un video no está disponible ──────────────
async function retryWithAlternative(queue, song) {
  if (!song?.name) return false;
  console.log(`  🔄 Buscando alternativa para: ${song.name}`);

  // Marcar URL como muerta para que el cache no la vuelva a usar
  markDead(song.url);

  try {
    const voiceChannel = queue.voiceChannel;
    if (!voiceChannel) return false;

    // Buscar alternativa — el resolver ya excluye deadUrls
    const alt = await resolveQuery(song.name);
    if (!alt || alt.url === song.url) return false;

    await distube.play(voiceChannel, alt.url, {
      textChannel: queue.textChannel,
      member: song.member,
      position: 1, // insertar como siguiente
    });

    queue.textChannel?.send({
      embeds: [new EmbedBuilder()
        .setColor(COLOR.WARN)
        .setDescription(`⚠️ Video no disponible — reproduciendo versión alternativa:\n**[${alt.name}](${alt.url})**`)
      ],
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 8_000)).catch(() => {});

    return true;
  } catch (e) {
    console.error("retryWithAlternative:", e.message);
    return false;
  }
}

// ── EVENTOS DISTUBE ──────────────────────────────────────────────────────────
distube
  .on("playSong", async (queue, song) => {
    console.log(`  ▶ ${song.name} [${song.formattedDuration}]`);
    addToHistory(queue.id, song);
    await sendNP(queue, song);
    // Pre-fetch siguiente y +1 para evitar latencias
    if (queue.songs[1]) prefetch(queue.songs[1].name).catch(() => {});
    if (queue.songs[2]) prefetch(queue.songs[2].name).catch(() => {});
  })

  .on("addSong", (queue, song) => {
    if (client.silentAdd.has(queue.id)) return;
    const pos  = queue.songs.length - 1;
    const user = song.member?.user;
    queue.textChannel?.send({
      embeds: [new EmbedBuilder()
        .setColor(COLOR.INFO)
        .setDescription(
          `**➕ [${song.name.length > 62 ? song.name.slice(0, 59) + "…" : song.name}](${song.url})**\n` +
          `📋 Posición \`#${pos}\`  ·  pedida por **${user?.username ?? "?"}**  ·  \`${song.formattedDuration}\``
        )
      ],
    }).catch(() => {});
    prefetch(song.name).catch(() => {});
  })

  .on("addList", (queue, playlist) => {
    if (client.silentAdd.has(queue.id)) return;
    queue.textChannel?.send({
      embeds: [new EmbedBuilder()
        .setColor(COLOR.INFO)
        .setDescription(`📋 **${playlist.name}** — **${playlist.songs.length}** canciones en cola`)
      ],
    }).catch(() => {});
  })

  .on("finish", queue => {
    stopNP(queue.id);
    client.silentAdd.delete(queue.id);
    leaveVoice(queue);
    queue.textChannel?.send({
      embeds: [new EmbedBuilder().setColor(COLOR.MUTED).setDescription("✅ Cola terminada. Usá `!play` para seguir.")],
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 8_000)).catch(() => {});
  })

  .on("empty",      queue => { stopNP(queue.id); client.silentAdd.delete(queue.id); leaveVoice(queue); })
  .on("disconnect", queue => { stopNP(queue.id); client.silentAdd.delete(queue.id); })

  .on("error", async (error, queue) => {
    const msg = error?.message ?? String(error);
    console.error("DisTube error:", msg);

    const q = queue;
    if (!q) return;

    const isUnavailable = /not available|unavailable|private|removed|copyright|blocked/i.test(msg);
    const isFfmpeg      = /ffmpeg/i.test(msg);
    const isNetwork     = /network|timeout|ECONNRESET|ETIMEDOUT|Error 404/i.test(msg);
    const currentSong   = q.songs[0];

    // Video no disponible → buscar alternativa rápidamente
    if (isUnavailable && currentSong) {
      try {
        const found = await retryWithAlternative(q, currentSong);
        if (found) {
          if (q.songs.length > 1) await q.skip();
          return;
        }
      } catch (retryErr) {
        console.error("retry failed:", retryErr.message);
      }
    }

    // Sin alternativa o error desconocido
    if (q.songs.length <= 1) {
      leaveVoice(q);
      stopNP(q.id);
      client.silentAdd.delete(q.id);
      q.textChannel?.send({
        embeds: [embedError("❌ No pude reproducir. Saliendo del canal.")],
      }).catch(() => {});
    } else {
      // Saltar automáticamente con mensaje breve
      q.textChannel?.send({
        embeds: [embedError("⚠️ Error, saltando…")],
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 2_500)).catch(() => {});
      try { distube.skip(q.id); } catch (e) { console.error("skip error:", e.message); }
    }
  });

// ── PREFIJO + DEBOUNCE POR USUARIO ───────────────────────────────────────────
const PREFIX = process.env.PREFIX || "!";
const cmdCooldowns = new Map(); // userId → timestamp para anti-spam global
const CMD_COOLDOWN_MS = 100; // 100ms entre comandos

client.on("messageCreate", async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot || !message.guild) return;
  
  // Anti-spam rápido
  const userCooldown = cmdCooldowns.get(message.author.id) ?? 0;
  const remaining = CMD_COOLDOWN_MS - (Date.now() - userCooldown);
  if (remaining > 0) return; // Ignorar silenciosamente spam muy cercano
  cmdCooldowns.set(message.author.id, Date.now());
  
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const cmd  = client.commands.get(name);
  if (!cmd) return;
  try {
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(`[${name}]:`, err.message);
    message.channel.send({ embeds: [embedError(err.message)] }).catch(() => {});
  }
});

// ── READY ─────────────────────────────────────────────────────────────────────
client.once("clientReady", () => {
  console.log(`\n  ✓ ${client.user.tag}  |  Prefijo: ${PREFIX}  |  ${client.commands.size} comandos\n`);
  const acts = [
    { text: `Usa: ${PREFIX}play · ${PREFIX}help`, type: ActivityType.Listening },
    { text: "Escuchando Música 🎵",                     type: ActivityType.Playing },
    { text: `${PREFIX}queue para ver la cola`, type: ActivityType.Watching },
  ];
  let i = 0;
  const setAct = () => client.user.setActivity(acts[i % acts.length].text, { type: acts[i % acts.length].type });
  setAct();
  setInterval(() => { i++; setAct(); }, 45_000);
});

client.login(process.env.DISCORD_TOKEN);