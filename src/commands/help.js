const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h", "commands", "ayuda"],
  description: "Lista de todos los comandos",
  async execute(message, args, client) {
    const P = process.env.PREFIX || "!";
    const limit = client.USER_QUEUE_LIMIT ?? 5;

    const embed = new EmbedBuilder()
      .setColor(client.COLOR.ACCENT)
      .setAuthor({
        name: "🎵 Kp-Music — Comandos",
        iconURL: client.user.displayAvatarURL(),
      })
      .setDescription(
        "Soporta **YouTube** y **Spotify** — videos, playlists y búsqueda por nombre.\n" +
        "Usa cookies para evitar bloqueos de YouTube."
      )
      .addFields(
        {
          name: "▶ Reproducción",
          value: [
            `\`${P}play <nombre o URL>\` — Reproduce una canción o playlist  *(alias: \`${P}p\`)*`,
            `\`${P}skip\` — Salta la canción actual  *(alias: \`${P}s\`, \`${P}next\`)*`,
            `\`${P}voteskip\` — Votación para saltear (50% del canal)  *(alias: \`${P}vs\`)*`,
            `\`${P}pause\` — Pausa / reanuda  *(alias: \`${P}resume\`)*`,
            `\`${P}stop\` — Detiene y desconecta  *(alias: \`${P}dc\`, \`${P}leave\`)*`,
          ].join("\n"),
        },
        {
          name: "📋 Cola e información",
          value: [
            `\`${P}np\` — Canción actual con barra de progreso  *(alias: \`${P}nowplaying\`)*`,
            `\`${P}queue\` — Ver la cola paginada  *(alias: \`${P}q\`, \`${P}list\`)*`,
            `\`${P}history\` — Últimas canciones reproducidas  *(alias: \`${P}h\`, \`${P}recent\`)*`,
          ].join("\n"),
        },
        {
          name: "⚙️ Configuración",
          value: [
            `\`${P}volume [1-100]\` — Ver o cambiar volumen  *(alias: \`${P}vol\`, \`${P}v\`)*`,
            `\`${P}loop <off|song|queue>\` — Modo de repetición  *(alias: \`${P}repeat\`, \`${P}r\`)*`,
            `\`${P}shuffle\` — Mezcla aleatoriamente la cola  *(alias: \`${P}mix\`)*`,
          ].join("\n"),
        },
        {
          name: "📌 Límites",
          value: [
            `• Máximo **${limit} canciones** por usuario en la cola`,
            `• Si una canción ya está en la cola, el bot te avisa`,
            `• Skip tiene cooldown de **1.5s** para evitar spam`,
          ].join("\n"),
        },
        {
          name: "💡 Ejemplos",
          value: [
            `\`${P}play lo que pidas\` — Búsqueda por nombre`,
            `\`${P}play https://youtu.be/...\` — Video de YouTube`,
            `\`${P}play https://youtube.com/playlist?list=...\` — Playlist de YouTube`,
            `\`${P}play https://open.spotify.com/track/...\` — Track de Spotify`,
            `\`${P}play https://open.spotify.com/playlist/...\` — Playlist de Spotify`,
          ].join("\n"),
        },
      )
      .setFooter({ text: `Prefijo: ${P}  ·  Kp-Music v4  ·  Límite por usuario: ${limit} canciones` });

    message.channel.send({ embeds: [embed] });
  },
};