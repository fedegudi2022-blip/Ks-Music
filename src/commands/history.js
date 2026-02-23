const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "history",
  aliases: ["recent", "h"],
  description: "Muestra las últimas canciones reproducidas",
  async execute(message, args, client) {
    const hist = client.songHistory?.get(message.guild.id);
    if (!hist || hist.length === 0)
      return message.reply({ embeds: [client.embedError("No hay historial en esta sesión.")] });

    const list = [...hist].reverse().slice(0, 10).map((s, i) =>
      `\`${String(i + 1).padStart(2)}\` [${s.name.length > 46 ? s.name.slice(0, 43) + "…" : s.name}](${s.url}) · \`${s.duration}\` · **${s.requestedBy}**`
    ).join("\n");

    message.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: `🕓 Historial de ${message.guild.name}` })
        .setDescription(list)
        .setFooter({ text: `Últimas ${Math.min(hist.length, 10)} canciones` })
      ],
    });
  },
};