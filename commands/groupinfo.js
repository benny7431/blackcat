const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "groupinfo",
  aliases: ["gi"],
  register: false,
  async execute(message, args) {
    const embed = new MessageEmbed();

    const members = await message.guild.members.fetch();
    const bot = members.filter(user => user.user.bot).size;
    const user = members.filter(user => !user.user.bot).size;
    const online = members.filter(user => user.presence.status === "online").size;
    const idle = members.filter(user => user.presence.status === "idle").size;
    const dnd = members.filter(user => user.presence.status === "dnd").size;
    const offline = members.filter(user => user.presence.status === "offline").size;

    embed.setTitle(`${message.guild.name}的資訊`);
    embed.setColor("#5865F2");
    embed.addField("ID", message.guild.id);
    embed.addField("擁有者", `${message.guild.owner.user.username} (<@${message.guild.owner.id}>)`);
    embed.addField("創建時間", message.guild.createdAt.toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      dateStyle: "short",
      timeStyle: "short"
    }));
    embed.addField(`總人數: ${message.guild.memberCount}`,
      `成員: ${user}\n`+
      `機器人: ${bot}\n\n`+
      `線上: ${online}\n`+
      `閒置: ${idle}\n`+
      `請勿打擾: ${dnd}\n`+
      `離線: ${offline}`);
    return message.channel.send({
      embeds: [embed]
    });
  }
};