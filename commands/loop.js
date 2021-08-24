const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "loop",
  aliases: ["l"],
  description: "重複歌單",
  execute(message) {
    const queue = message.client.players.get(message.guild.id);
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
    if (!canModifyQueue(message.member)) {
      return message.reply("❌ ┃ 你必須跟我在同一個頻道裡!")
        .catch(console.error);
    }

    queue.toggleLoop();
    return message.reply(`${queue.loop ? "🔁 " : ""}重複播放清單目前為 ${queue.loop ? "啟動\n將會重複歌單!" : "關閉"}!`)
      .catch(console.error);
  }
};