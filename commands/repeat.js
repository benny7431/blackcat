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
    const queue = message.client.players.get(message.guild.id);
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

    queue.repeat();
    if(message.slash) return message.slash.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`)
      .catch(console.error);
    else return message.channel.send(`${queue.repeat ? "🔂 ┃ " : ""}重複播放目前為 ${queue.repeat ? "啟動  將會重複目前的歌曲!" : "關閉"}!`)
      .catch(console.error);
  }
};