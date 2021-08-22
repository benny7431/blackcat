const { Permissions } = require("discord.js");

module.exports = {
  name: "kick",
  description: "踢出別人",
  register: false,
  async execute(message) {
    if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return message.reply("❌ ┃ 你沒有足夠的權限!")
      .catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return message.reply("❌ ┃ 我沒有足夠的權限!")
      .catch(console.error);

    let member = message.options.getMember("用戶");
    try {
      if (!member) return message.reply("❌ ┃ 無法取得成員")
        .catch(console.error);
      await member.kick(`由${message.user.username}踢出`).catch(console.error);
    } catch {
      return message.reply("❌ ┃ 我無法踢出該成員，或是在踢出時發生錯誤!")
        .catch(console.error);
    }
    return message.reply(`✅ ┃ 成功把${member.user.username}踢出!`)
      .catch(console.error);
  }
};