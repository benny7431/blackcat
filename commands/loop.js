const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "loop",
  aliases: ["l"],
  description: "重複歌單",
  register: true,
  slash: {
    name: "loop",
    description: "重複歌單",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) {
      if (message.slash) message.slash.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
      return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      if (message.slash) return message.slash
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
      else return message.channel
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    queue.loop();
    if (message.slash) return message.slash
      .send(`${queue.loop ? "🔁 " : ""}重複播放清單目前為 ${queue.loop ? "啟動\n將會重複歌單!" : "關閉"}!`)
      .catch(console.error);
    else return message.channel
      .send(`${queue.loop ? "🔁 " : ""}重複播放清單目前為 ${queue.loop ? "啟動\n將會重複歌單!" : "關閉"}!`)
      .catch(console.error);
  }
};