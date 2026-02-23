const { RepeatMode } = require("distube");

const MODES = {
  off:   RepeatMode.DISABLED,
  song:  RepeatMode.SONG,
  queue: RepeatMode.QUEUE,
  "0":   RepeatMode.DISABLED,
  "1":   RepeatMode.SONG,
  "2":   RepeatMode.QUEUE,
};

const LABELS = {
  [RepeatMode.DISABLED]: "🔕 Loop desactivado",
  [RepeatMode.SONG]:     "🔂 Repitiendo canción actual",
  [RepeatMode.QUEUE]:    "🔁 Repitiendo toda la cola",
};

const CURRENT_LABELS = ["🔕 Desactivado", "🔂 Canción", "🔁 Cola"];

module.exports = {
  name: "loop",
  aliases: ["repeat", "r"],
  description: "Modo de repetición: off / song / queue",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const P = process.env.PREFIX || "!";
    const mode = args[0]?.toLowerCase();

    if (!mode || !Object.hasOwn(MODES, mode)) {
      return message.reply({
        embeds: [client.embedInfo(
          "🔁 Modo de repetición",
          `**Actual:** ${CURRENT_LABELS[queue.repeatMode]}\n\n` +
          `**Opciones:**\n` +
          `\`${P}loop off\` — Desactivar\n` +
          `\`${P}loop song\` — Repetir canción\n` +
          `\`${P}loop queue\` — Repetir cola`
        )],
      });
    }

    queue.setRepeatMode(MODES[mode]);
    message.reply({ embeds: [client.embedSuccess("🔁 Loop", LABELS[MODES[mode]])] });
  },
};
