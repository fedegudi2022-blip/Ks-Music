module.exports = {
  name: "pause",
  aliases: ["resume"],
  description: "Pausa o reanuda la reproducción",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const userVC = message.member?.voice?.channel;
    const botVC  = message.guild.members.me?.voice?.channel;
    if (botVC && (!userVC || userVC.id !== botVC.id))
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    const name = queue.songs[0]?.name ?? "canción";
    try {
      if (queue.paused) {
        queue.resume();
        await message.react("▶").catch(() => {});
        message.reply({ embeds: [client.embedSuccess("▶ Reanudado", name)] });
      } else {
        queue.pause();
        await message.react("⏸").catch(() => {});
        message.reply({ embeds: [client.embedSuccess("⏸ Pausado", name)] });
      }
    } catch (err) {
      message.reply({ embeds: [client.embedError(err.message)] });
    }
  },
};