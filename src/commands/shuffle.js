module.exports = {
  name: "shuffle",
  aliases: ["mix"],
  description: "Mezcla la cola aleatoriamente",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    if (queue.songs.length <= 2)
      return message.reply({ embeds: [client.embedError("Necesitás al menos **2 canciones** en cola para mezclar.")] });

    const userVC = message.member?.voice?.channel;
    const botVC  = message.guild.members.me?.voice?.channel;
    if (botVC && (!userVC || userVC.id !== botVC.id))
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    queue.shuffle();
    message.reply({
      embeds: [client.embedSuccess("🔀 Mezclado", `${queue.songs.length - 1} canciones reordenadas aleatoriamente.`)],
    });
  },
};
