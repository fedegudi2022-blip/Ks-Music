module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  description: "Ver o cambiar el volumen (1-100)",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const volIcon = v => v === 0 ? "🔇" : v < 35 ? "🔈" : v < 70 ? "🔉" : "🔊";
    const P = process.env.PREFIX || "!";

    if (!args[0]) {
      const v   = queue.volume;
      const bar = "█".repeat(Math.round(v / 10)) + "░".repeat(10 - Math.round(v / 10));
      return message.reply({
        embeds: [client.embedInfo(
          `${volIcon(v)} Volumen actual`,
          `\`[${bar}]\` **${v}%**\n\nUsá \`${P}volume <1-100>\` para cambiar.`
        )],
      });
    }

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 1 || vol > 100)
      return message.reply({ embeds: [client.embedError("El volumen debe ser un número entre **1** y **100**.")] });

    queue.setVolume(vol);
    const bar = "█".repeat(Math.round(vol / 10)) + "░".repeat(10 - Math.round(vol / 10));
    message.reply({
      embeds: [client.embedSuccess(`${volIcon(vol)} Volumen`, `\`[${bar}]\` **${vol}%**`)],
    });
  },
};
