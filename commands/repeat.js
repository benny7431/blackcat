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
    if (!queue) return message.channel.send("❌ ┃ 現在沒有人在播放音樂欸030").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.repeat();
    if(message.slash) return message.slash.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`)
      .catch(console.error);
    else return message.channel.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`)
      .catch(console.error);
  }
};