module.exports = {
  name: "np",
  aliases: ["nowplaying", "current"],
  description: "Muestra la canción actual con barra de progreso",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue || !queue.songs.length)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const song = queue.songs[0];
    const cur  = queue.currentTime ?? 0;
    const tot  = song.duration ?? 0;
    const pct  = tot > 0 ? Math.round((cur / tot) * 100) : 0;
    const BAR  = 20;
    const pos  = Math.round(Math.min(1, tot > 0 ? cur / tot : 0) * BAR);
    const bar  = "─".repeat(Math.max(0, pos)) + "◉" + "─".repeat(Math.max(0, BAR - pos));

    const fmt = s => {
      if (!s || isNaN(s) || s < 0) return "0:00";
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = String(Math.floor(s % 60)).padStart(2, "0");
      return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
    };

    const inQueue = Math.max(0, queue.songs.length - 1);
    const { EmbedBuilder } = require("discord.js");
    const user = song.member?.user;

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(queue.paused ? 0x4E5058 : 0x1DB954)
        .setDescription(
          `**${queue.paused ? "⏸" : "▶"} [${song.name}](${song.url})**\n\n` +
          `\`${fmt(cur)}\` \`${bar}\` \`${fmt(tot)}\`\n` +
          `**${pct}%** completado` +
          (inQueue > 0 ? `  ·  📋 ${inQueue} siguiente${inQueue !== 1 ? "s" : ""}` : "")
        )
        .setThumbnail(song.thumbnail ?? null)
        .setFooter({ text: `Pedida por ${user?.username ?? "?"}` })
      ],
    });
  },
};