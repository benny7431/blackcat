const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "stop",
  aliases: ["dc", "disconnect"],
  description: "停止播放歌曲",
  register: true,
  slash: {
    name: "stop",
    description: "停止播放歌曲",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) {
      if (message.slash) message.slash.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
      return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);;
    }
    if (!canModifyQueue(message.member)) {
      if (message.slash) return message.slash
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
      else return message.channel
        .send("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    try {
      queue.songs = [];
      queue.stop();
    } catch {
      try {
        queue.connection.destroy();
      } catch (e) {
        console.log(e);
      }
      if (message.slash) return message.slash.send("<:stop:827734840891015189> ┃ 停止播放歌曲停止播放歌曲時發生錯誤, 已強制停止音樂")
        .catch(console.error);
      else return message.channel.send("<:stop:827734840891015189> ┃ 停止播放歌曲停止播放歌曲時發生錯誤, 已強制停止音樂")
        .catch(console.error);
    }
    if (message.slash) message.slash.send("<:stop:827734840891015189> ┃ 停止播放歌曲")
      .catch(console.error);
    else message.channel.send("<:stop:827734840891015189> ┃ 停止播放歌曲")
      .catch(console.error);
  }
};