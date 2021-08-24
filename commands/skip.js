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
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    queue.skip();
    message.reply("<:skip:827734282318905355> ┃ 跳過目前歌曲")
      .catch(console.error);
  }
};