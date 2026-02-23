const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "stop",
  aliases: ["dc", "leave"],
  description: "Detiene la música, limpia la cola y desconecta el bot",
  async execute(message, args, client) {
    const userVC = message.member?.voice?.channel;
    const botVC  = message.guild.members.me?.voice?.channel;

    if (!botVC)
      return message.reply({ embeds: [client.embedError("No estoy en ningún canal de voz.")] });

    if (!userVC || userVC.id !== botVC.id)
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    // 1. DisTube v5: voices.get(guild).leave() es el método correcto
    try {
      client.distube.voices.get(message.guild)?.leave();
    } catch {}

    // 2. Detener la queue
    try {
      const queue = client.distube.getQueue(message);
      if (queue) await queue.stop();
    } catch {}

    // 3. Destruir conexión @discordjs/voice
    try {
      const conn = getVoiceConnection(message.guild.id);
      if (conn) conn.destroy();
    } catch {}

    // 4. Fallback API de Discord
    try {
      await message.guild.members.me.voice.disconnect();
    } catch {}

    message.reply({ embeds: [client.embedSuccess("👋 Desconectado", "Música detenida y salí del canal.")] });
  },
};