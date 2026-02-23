// ── DEBOUNCE POR GUILD: evita spam de skip ────────────────────────────────────
const skipCooldown = new Map(); // guildId → timestamp
const SKIP_COOLDOWN_MS = 1500;

module.exports = {
  name: "skip",
  aliases: ["s", "next"],
  description: "Salta la canción actual",
  async execute(message, args, client) {
    const guildId = message.guild.id;

    // Cooldown anti-spam
    const last = skipCooldown.get(guildId) ?? 0;
    const remaining = Math.max(0, SKIP_COOLDOWN_MS - (Date.now() - last));
    if (remaining > 0) {
      return message.reply({
        embeds: [client.embedError(`Esperá \`${(remaining / 1000).toFixed(1)}s\` antes de volver a skipear.`)],
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }
    skipCooldown.set(guildId, Date.now());

    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const userVC = message.member?.voice?.channel;
    const botVC  = message.guild.members.me?.voice?.channel;
    if (botVC && (!userVC || userVC.id !== botVC.id))
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    // Pre-fetch del siguiente al siguiente para saltos encadenados rápidos
    const upcoming = queue.songs[2];
    if (upcoming?.name) client.prefetch(upcoming.name).catch(() => {});

    try {
      if (queue.songs.length <= 1) {
        await queue.stop();
        message.reply({ embeds: [client.embedSuccess("⏹ Detenido", "No había más canciones.")] });
      } else {
        await queue.skip();
        message.react("⏭").catch(() => {});
      }
    } catch (err) {
      console.error("skip error:", err.message);
      message.reply({ embeds: [client.embedError(`No pude saltear: ${err.message}`)] });
    }
  },
};