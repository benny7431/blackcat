const { Permissions } = require("discord.js");

module.exports = {
  name: "ban",
  description: "封鎖成員",
  async execute(message) {
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.reply("❌ ┃ 你沒有足夠的權限!")
      .catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.reply("❌ ┃ 我沒有足夠的權限!")
      .catch(console.error);

    let member = message.options.getMember("用戶");
    try {
      if (!member) return message.reply("❌ ┃ 無法取得成員")
        .catch(console.error);
      await member.ban({
        reason: `由${message.user.username}驅逐`
      }).catch(console.error);
    } catch {
      return message.reply("❌ ┃ 我無法驅逐該成員，或是在驅逐時發生錯誤!")
        .catch(console.error);
    }
    return message.reply(`✅ ┃ 成功把${member.user.username}驅逐!`)
      .catch(console.error);
  }
};