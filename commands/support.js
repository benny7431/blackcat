const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "support",
  description: "取得支援",
  register: false,
  async execute(message, args) {
    if (!args.length) return message.channel.send("❌ ┃ 請輸入支援訊息，這有助於開發者加快支援速度!");
    const filter = msg => msg.author.id === message.author.id;
    const sent = await message.channel.send("❓ ┃ 你確定要聯絡Black cat官方客服?\n請輸入`yes`確定\n\n請注意，輸入不適合的訊息有可能會被列入黑名單!");
    const awaitMessage = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 60000,
      errors: ["time"]
    });
    const choice = awaitMessage.first();
    if (choice.content === "yes") {
      let invite = null;
      try {
        invite = await message.channel.createInvite({
          maxAge: 0
        });
      } catch (err) {
        return sent.edit("❌ ┃ 無法建立邀請連結，請確認我有沒有相關的權限!");
      }
      const embed = new MessageEmbed()
        .setTitle("Black cat客服")
        .setColor("#5865F2")
        .setDescription(`✅ ┃ 已聯絡客服，原因為${args.join(" ")}`)
        .setFooter(`${message.guild.id}-${process.env.HEROKU_RELEASE_VERSION}-${process.env.HEROKU_SLUG_DESCRIPTION}`);
      const owner = await message.client.users.fetch("669194742218752070");
      if (owner.presence.status === "offline") embed.setFooter("⚠️ ┃ 客服目前為離線狀態，可能需要等待較長時間(10分鐘~5天)");
      message.channel.send({
        embeds: [embed]
      });
      sent.delete();
      const adminGuild = await message.client.guilds.fetch("721001394248613978");
      const adminChannel = await adminGuild.channels.cache.get("810500178762530836");
      const supportEmbed = new MessageEmbed()
        .setTitle("錯誤回報")
        .setDescription(
          `${message.author.username}回報錯誤\n\n` +
          `錯誤內容:${args.join(" ")}\n` +
          "https://discord.gg/" + invite)
        .setFooter(`${message.guild.id}-${process.env.HEROKU_RELEASE_VERSION}-${process.env.HEROKU_SLUG_DESCRIPTION}`);
      adminChannel.send({
        embeds: [supportEmbed]
      });
    } else {
      return sent.edit("❌ ┃ 已取消");
    }
  }
};