const { Permissions } = require("discord.js");

module.exports = {
  name: "kick",
  description: "踢出別人",
  register: false,
  async execute(message) {
    if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS) && message.author.id !== "669194742218752070") return message.channel.send("❌ ┃ 你沒有足夠的權限!")
      .catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return message.channel.send("❌ ┃ 我沒有足夠的權限!")
      .catch(console.error);

    if (message.mentions.members.size === 0 ||!args.length) return message.channel
      .send("❌ ┃ 請標記要踢出的那個人!")
      .catch(console.error);
    let member;
    try {
      if (message.mentions.members.size >= 1) {
        if (!message.mentions.members.first().bannable) return message.channel
          .send("❌ ┃ 我無法踢出該成員! 請確定我的身份組在被踢出人的上方!")
          .catch(console.error);
        await message.mentions.members.first().kick({
          reason: `由${message.author.username}踢出`
        }).catch(console.error);
      } else if (args.length) {
        member = await message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("❌ ┃ 找不到那個成員!")
          .catch(console.error);
        if (!member.kickable) return message.channel
          .send("❌ ┃ 我無法踢出該成員! 請確定我的身份組在被驅逐人的上方!")
          .catch(console.error);
        member.kick({
          reason: `由${message.author.username}踢出`
        }).catch(console.error);
      }
    } catch {
      return message.channel.send("❌ ┃ 我無法踢出該成員!")
        .catch(console.error);
    }
    return message.channel.send(`✅ ┃ 成功把${member.user.username}踢出!`)
      .catch(console.error);
  }
};