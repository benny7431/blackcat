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
    if (!queue) return message.channel.send("❌ ┃ 現在沒有人在播放音樂欸030").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    queue.repeat = false;
    queue.loop = !queue.loop;
    if (message.slash.raw) return message.slash.send(`${queue.loop ? "🔁 " : ""}重複播放清單目前為 ${queue.loop ? "啟動\n將會重複歌單!" : "關閉"}!`);
    else return queue.textChannel
      .send(`${queue.loop ? "🔁 " : ""}重複播放清單目前為 ${queue.loop ? "啟動\n將會重複歌單!" : "關閉"}!`)
      .catch(console.error);
  }
};