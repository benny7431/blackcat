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
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放!").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    try {
      queue.songs = [];
      queue.connection.dispatcher.end();
    } catch {
      try {
        queue.connection.disconnect();
      } catch (e) {
        console.log(e);
      }
      return queue.textChannel.send("<:stop:827734840891015189> ┃ 停止播放歌曲停止播放歌曲時發生錯誤, 已強制停止音樂").catch(console.error);
    }
    queue.textChannel.send("<:stop:827734840891015189> ┃ 停止播放歌曲").catch(console.error);
  }
};