const { Permissions } = require("discord.js");

module.exports = {
  name: "ban",
  description: "封鎖成員",
  register: false,
  async execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) && message.author.id !== "669194742218752070") return message.channel.send("❌ ┃ 你沒有足夠的權限!").catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.channel.send("❌ ┃ 我沒有足夠的權限!");

    if (message.mentions.members.size === 0 || !args.length) return message.channel.send("❌ ┃ 請標記要驅逐的那個人!").catch(console.error);
    let member;
    try {
      if (message.mentions.members.size >= 1) {
        await message.mentions.members.first().ban({ reason: `由${message.author.username}驅逐` }).catch(console.error);
      } else if (args.length) {
        try {
          member = await message.guild.members.fetch(args[0]);
        } catch {
          return message.channel.send("❌ ┃ 找不到被標記的成員!").catch(console.error);
        }
        member.ban({
          reason: `由${message.author.username}驅逐`
        }.catch(console.error));
      }
    } catch (error) {
      console.log(error);
      return message.channel.send("❌ ┃ 我無法驅逐該成員! 請確定我的身份組在被驅逐人的上方!").catch(console.error);
    }
    await member.user.send(`☠ ┃ 你在${message.guild.name}中被${message.author.username}驅逐了`).catch(console.error);
    return message.channel.send(`✅ ┃ 成功把${member.user.username}驅逐!`).catch(console.error);
  }
};