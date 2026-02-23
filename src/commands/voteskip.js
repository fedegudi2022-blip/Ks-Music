const { EmbedBuilder } = require("discord.js");

// guildId → { votes: Set<userId>, msg, timeout }
const voteMap = new Map();
const VOTE_TIMEOUT = 30_000; // 30 segundos para votar
const VOTE_RATIO   = 0.5;    // 50% del canal necesita votar

module.exports = {
  name: "voteskip",
  aliases: ["vs"],
  description: "Inicia una votación para saltear la canción actual",
  async execute(message, args, client) {
    const queue = client.distube.getQueue(message);
    if (!queue || !queue.songs.length)
      return message.reply({ embeds: [client.embedError("No hay nada reproduciéndose.")] });

    const userVC = message.member?.voice?.channel;
    const botVC  = message.guild.members.me?.voice?.channel;
    if (!userVC || !botVC || userVC.id !== botVC.id)
      return message.reply({ embeds: [client.embedError("Tenés que estar en el mismo canal de voz.")] });

    const guildId   = message.guild.id;
    const members   = botVC.members.filter(m => !m.user.bot).size;
    const needed    = Math.ceil(members * VOTE_RATIO);

    // Si ya hay votación activa, agregar voto
    if (voteMap.has(guildId)) {
      const v = voteMap.get(guildId);
      if (v.votes.has(message.author.id))
        return message.reply({ embeds: [client.embedError("Ya votaste.")] });

      v.votes.add(message.author.id);
      const count = v.votes.size;

      if (count >= needed) {
        clearTimeout(v.timeout);
        voteMap.delete(guildId);
        v.msg?.edit({
          embeds: [new EmbedBuilder()
            .setColor(0x1DB954)
            .setDescription(`✅ Votación aprobada **(${count}/${needed})** — saltando…`)
          ],
        }).catch(() => {});
        try {
          queue.songs.length <= 1 ? await queue.stop() : await queue.skip();
        } catch {}
      } else {
        v.msg?.edit({
          embeds: [buildVoteEmbed(queue.songs[0].name, count, needed, members)],
        }).catch(() => {});
        message.react("✅").catch(() => {});
      }
      return;
    }

    // Nueva votación
    const votes = new Set([message.author.id]);
    const count = votes.size;

    if (count >= needed) {
      // Solo hay 1 persona en el canal — skip directo
      try {
        queue.songs.length <= 1 ? await queue.stop() : await queue.skip();
        message.react("⏭").catch(() => {});
      } catch (err) {
        message.reply({ embeds: [client.embedError(err.message)] });
      }
      return;
    }

    const msg = await message.channel.send({
      embeds: [buildVoteEmbed(queue.songs[0].name, count, needed, members)],
    }).catch(() => null);

    const timeout = setTimeout(() => {
      if (!voteMap.has(guildId)) return;
      voteMap.delete(guildId);
      msg?.edit({
        embeds: [new EmbedBuilder()
          .setColor(0xED4245)
          .setDescription(`❌ Votación expirada — no se alcanzaron los votos **(${voteMap.get(guildId)?.votes?.size ?? count}/${needed})**`)
        ],
      }).catch(() => {});
    }, VOTE_TIMEOUT);

    voteMap.set(guildId, { votes, msg, timeout });
    message.react("✅").catch(() => {});
  },
};

function buildVoteEmbed(songName, count, needed, total) {
  const bar = "█".repeat(count) + "░".repeat(Math.max(0, needed - count));
  return new EmbedBuilder()
    .setColor(0xFAA61A)
    .setDescription(
      `**⏭ Votación para saltear**\n` +
      `[${songName.length > 50 ? songName.slice(0, 47) + "…" : songName}]\n\n` +
      `\`${bar}\` **${count}/${needed}** votos\n` +
      `*(${total} personas en el canal — escribí \`!voteskip\` para votar)*\n\n` +
      `⏳ Expira en 30 segundos`
    );
}