const { Permissions } = require("discord.js");

module.exports = {
  name: "ban",
  description: "封鎖成員",
  register: true,
  slash: {
    name: "ban",
    description: "封鎖成員",
    options: [{
      name: "成員",
      type: "USER",
      description: "要封鎖的成員",
      required: true,
    }],
  },
  async execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS) && message.author.id !== "669194742218752070") return message.channel.send("❌ ┃ 你沒有足夠的權限!")
      .catch(console.error);
    if (!message.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.channel.send("❌ ┃ 我沒有足夠的權限!")
      .catch(console.error);

    if (message.mentions.members.size === 0 ||!args.length) return message.channel
      .send("❌ ┃ 請標記要驅逐的那個人!")
      .catch(console.error);
    let member;
    try {
      if (message.mentions.members.size >= 1) {
        if (!message.mentions.members.first().bannable) return message.channel
          .send("❌ ┃ 我無法驅逐該成員! 請確定我的身份組在被驅逐人的上方!")
          .catch(console.error);
        await message.mentions.members.first().ban({
          reason: `由${message.author.username}驅逐`
        }).catch(console.error);
      } else if (args.length) {
        member = await message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send("❌ ┃ 找不到那個成員!")
          .catch(console.error);
        if (!member.bannable) return message.channel
          .send("❌ ┃ 我無法驅逐該成員! 請確定我的身份組在被驅逐人的上方!")
          .catch(console.error);
        member.ban({
          reason: `由${message.author.username}驅逐`
        }).catch(console.error);
      }
    } catch {
      return message.channel.send("❌ ┃ 我無法驅逐該成員!")
        .catch(console.error);
    }
    return message.channel.send(`✅ ┃ 成功把${member.user.username}驅逐!`)
      .catch(console.error);
  }
};