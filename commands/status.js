const os = require("os");
const osu = require("node-os-utils");
const pidusage = require("pidusage");
const prism = require("prism-media");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "status",
  description: "查看現在機器人的狀態",
  aliases: ["stats"],
  register: true,
  slash: {
    name: "status",
    description: "查看現在機器人的狀態",
  },
  slashReply: true,
  async execute(message) {
    let cpu = os.cpus()[0];
    let system = await osu.os.oos();
    let hostname = await osu.os.hostname();
    let memInfo = await osu.mem.info();
    let processUsage = await pidusage(process.pid);
    let memTotal = Math.round(memInfo.totalMemMb / 1024 * 10) / 10;
    let memUsed = Math.round(memInfo.usedMemMb / 1024 * 10) / 10;
    let memBot = Math.round((processUsage.memory / 1024 / 1024) * 100) / 100;
    let memPercent = 100 - Math.round(memInfo.freeMemPercentage * 10) / 10;
    let seconds = Math.floor(message.client.uptime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    let ffmpeg = prism.FFmpeg.getInfo().version;

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    const embed = new MessageEmbed()
      .setTitle("🤖 ┃ 機器人狀態")
      .addField("🕒 ┃ 上線時間", `${days}天 ${hours}小時 ${minutes}分鐘 ${seconds}秒`)
      .addField("<:linux:825348759675338763> ┃ 系統資訊", `${system}`)
      .addField("<:server:825348586849697792> ┃ 主機資訊", `於${hostname}上運行機器人`)
      .addField("<:nodejs:825348691018907648> ┃ 程式資訊", `Node.js ${process.version.replace("v", "")}`)
      .addField("<:djs:825712204811599873> ┃ 程式架構資訊", `Discord.js ${require("discord.js").version}`)
      .addField("<:ffmpeg:864066680565137438> ┃ 解碼器資訊", `FFmpeg ${ffmpeg}`)
      .addField("<:cpu:825348830115528734> ┃ 處理器資訊", `${cpu.model} (${(Math.floor(cpu.speed / 100)) / 10}GHz)`)
      .addField("<:ram:825348875132731432> ┃ 記憶體資訊", `**機器人:** ${memBot} MB, **主機:** ${memUsed}/${memTotal} GB (${memPercent}%)`)
      .addField("<:servers:825537523065159710> ┃ 伺服器數量", `${message.client.guilds.cache.size}個伺服器`)
      .addField("<:music:825646714404077569> ┃ 音樂播放狀態", `有${message.client.queue.size}個伺服器正在播放音樂`)
      .setColor("BLURPLE");

    if(message.slash) return message.slash.send({
      embeds: [embed]
    }).catch(console.error);
    else return message.channel.send({
      embeds: [embed]
    }).catch(console.error);
  }
};