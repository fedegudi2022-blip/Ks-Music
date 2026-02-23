const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

module.exports = {
  name: "queue",
  aliases: ["q", "list"],
  description: "Cola de canciones con paginación",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue || !queue.songs.length) {
      const P = process.env.PREFIX || "!";
      return message.reply({
        embeds: [client.embedInfo("Cola vacía", `Usá \`${P}play\` para agregar canciones.`)],
      });
    }

    const perPage = 10;
    const pages   = Math.max(1, Math.ceil((queue.songs.length - 1) / perPage));
    let   page    = Math.max(0, Math.min((parseInt(args[0]) || 1) - 1, pages - 1));

    if (pages === 1)
      return message.channel.send({ embeds: [client.embedQueue(queue, message.guild.name, 0)] });

    const makeRow = p => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("q_first").setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(p === 0),
      new ButtonBuilder().setCustomId("q_prev") .setEmoji("◀️").setStyle(ButtonStyle.Primary)  .setDisabled(p === 0),
      new ButtonBuilder().setCustomId("q_info") .setLabel(`${p + 1} / ${pages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId("q_next") .setEmoji("▶️").setStyle(ButtonStyle.Primary)  .setDisabled(p === pages - 1),
      new ButtonBuilder().setCustomId("q_last") .setEmoji("⏭️").setStyle(ButtonStyle.Secondary).setDisabled(p === pages - 1),
    );

    const msg = await message.channel.send({
      embeds:     [client.embedQueue(queue, message.guild.name, page)],
      components: [makeRow(page)],
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === message.author.id,
      time: 90_000,
      idle: 45_000,
    });

    collector.on("collect", async i => {
      switch (i.customId) {
        case "q_first": page = 0; break;
        case "q_prev":  page = Math.max(0, page - 1); break;
        case "q_next":  page = Math.min(pages - 1, page + 1); break;
        case "q_last":  page = pages - 1; break;
      }
      const q = client.distube.getQueue(message);
      if (!q) { collector.stop(); return i.update({ components: [] }); }
      await i.update({
        embeds:     [client.embedQueue(q, message.guild.name, page)],
        components: [makeRow(page)],
      });
    });

    collector.on("end", () => msg.edit({ components: [] }).catch(() => {}));
  },
};
