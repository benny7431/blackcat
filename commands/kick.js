const { Permissions } = require("discord.js");

module.exports = {
  name: "kick",
  description: "踢出別人",
  register: false,
  async execute(message) {
    if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS) && message.author.id !== "669194742218752070") return message.channel.send("❌ ┃ 你沒有足夠的權限!").catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return message.channel.send("❌ ┃ 我沒有足夠的權限!").catch(console.error);

    if (message.mentions.members.size === 0) return message.channel.send("❌ ┃ 請標記一個人!").catch(console.error);
    try {
      await message.mentions.members.first().kick(`由${message.author.username}踢出`);
    } catch (error) {
      console.log(error);
      return message.channel.send("❌ ┃ 踢出時發生問題").catch(console.error);
    }
    await message.mentions.members.first().user.send(`☠️ ┃ 你在${message.guild.name}中被${message.author.username}踢出了`).catch(console.error);
    return message.channel.send("✅ ┃ 成功踢出!").catch(console.error);
  }
};