const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "repeat",
  description: "重複歌曲",
  slash: {
    name: "repeat",
    description: "重複歌曲",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 現在沒有人在播放音樂欸030");
      else return message.channel.send("❌ ┃ 現在沒有人在播放音樂欸030").catch(console.error);
    }
    if (!canModifyQueue(message.member)) return;
    if (queue.songs[0].type === "radio") {
      if (message.slash.raw) return message.slash.send("❌ ┃ 在播放電台的狀況下好像不能使用重複播放(╯︵╰,)");
      else return message.channel.send("❌ ┃ 在播放電台的狀況下好像不能使用重複播放(╯︵╰,)").catch(console.error);
    }

    queue.loop = false;
    queue.repeat = !queue.repeat;
    if (message.slash.raw) return message.slash.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`);
    else return queue.textChannel.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`).catch(console.error);
  }
};