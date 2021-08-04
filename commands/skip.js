const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "skip",
  aliases: ["s"],
  description: "跳過目前正在播放的歌曲",
  register: true,
  slash: {
    name: "skip",
    description: "跳過目前正在播放的歌曲",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.skip();
    if (message.slash) return message.slash.send("<:skip:827734282318905355> ┃ 跳過目前歌曲")
      .catch(console.error);
    return queue.textChannel.send("<:skip:827734282318905355> ┃ 跳過目前歌曲")
      .catch(console.error);
  }
};