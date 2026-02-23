const { EmbedBuilder } = require("discord.js");

// Cooldown igual que skip
const cooldown = new Map();
const COOLDOWN_MS = 1500;

module.exports = {
  name: "playnext",
  aliases: ["pn", "insertar"],
  description: "Agrega una canción para sonar inmediatamente después de la actual",
  async execute(message, args, client) {
    const guildId = message.guild.id;

    // Cooldown anti-spam
    const last = cooldown.get(guildId) ?? 0;
    const remaining = Math.max(0, COOLDOWN_MS - (Date.now() - last));
    if (remaining > 0)
      return message.reply({
        embeds: [client.embedError(`Esperá \`${(remaining / 1000).toFixed(1)}s\` antes de usar esto de nuevo.`)],
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    cooldown.set(guildId, Date.now());

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel)
      return message.reply({ embeds: [client.embedError("Tenés que estar en un canal de voz.")] });

    const botVoice = message.guild.members.me?.voice?.channel;
    if (botVoice && botVoice.id !== voiceChannel.id)
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    const queue = client.distube.getQueue(message);
    if (!queue || !queue.songs.length)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose. Usá `!play` primero.")] });

    const input = args.join(" ").trim();
    if (!input) {
      const P = process.env.PREFIX || "!";
      return message.reply({
        embeds: [client.embedInfo(
          "¿Qué querés poner primero?",
          `**Uso:** \`${P}playnext <nombre o URL>\`\n` +
          `La canción se agrega justo después de la que está sonando.`
        )],
      });
    }

    const hasYtApi   = !!process.env.YOUTUBE_API_KEY;
    const searchName = input.length > 60 ? input.slice(0, 57) + "…" : input;
    const eta        = /^https?:\/\//.test(input) ? "~2-4s" : (hasYtApi ? "~1-2s" : "~5-10s");

    const statusMsg = await message.channel.send({
      embeds: [new EmbedBuilder().setColor(0x2B2D31)
        .setDescription(`🔍 Buscando **${searchName}**…  \`${eta}\``)
      ],
    }).catch(() => null);

    const deleteStatus = () => statusMsg?.delete().catch(() => {});

    let resolved;
    try {
      resolved = await Promise.race([
        client.resolveQuery(input),
        new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout (20s)")), 20_000)),
      ]);
    } catch (err) {
      await statusMsg?.edit({ embeds: [new EmbedBuilder().setColor(client.COLOR.ERROR).setDescription(`**✗** ${err.message}`)] }).catch(() => {});
      setTimeout(deleteStatus, 5_000);
      return;
    }

    if (!resolved || resolved.type !== "single") {
      await statusMsg?.edit({ embeds: [new EmbedBuilder().setColor(client.COLOR.ERROR).setDescription(`**✗** No encontré nada para: **${searchName}**`)] }).catch(() => {});
      setTimeout(deleteStatus, 6_000);
      return;
    }

    await deleteStatus();

    try {
      // addToQueue con position 1 = justo después de la canción actual
      await client.distube.play(voiceChannel, resolved.url, {
        message,
        textChannel: message.channel,
        member: message.member,
        position: 1, // <-- la clave: inserta en posición 1 (después de la actual)
      });

      message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(client.COLOR.ACCENT)
          .setDescription(
            `**⏭ [${resolved.name?.length > 62 ? resolved.name.slice(0, 59) + "…" : resolved.name ?? "Canción"}](${resolved.url})**\n` +
            `Suena después de la canción actual  ·  pedida por **${message.member.user.username}**`
          )
        ],
      }).catch(() => {});
    } catch (err) {
      console.error("playnext error:", err.message);
      message.channel.send({ embeds: [client.embedError(`No pude agregar eso: ${err.message}`)] });
    }
  },
};