const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "pause",
  description: "暫停歌曲",
  register: true,
  slash: {
    name: "pause",
    description: "暫停歌曲",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("❌ ┃ 現在沒有人在播放音樂欸030").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (queue.playing) {
      queue.pause();
      if(message.slash) return message.slash.send("<:pause:827737900359745586> ┃ 歌曲已暫停")
        .catch(console.error);
      else return message.channel.send("<:pause:827737900359745586> ┃ 歌曲已暫停")
        .catch(console.error);
    } else {
      if(message.slash) return message.slash.send("❌ ┃ 歌曲已經暫停了(･ัω･ั)").catch(console.error);
      else return message.channel.send("❌ ┃ 歌曲已經暫停了(･ัω･ั)").catch(console.error);
    }
  }
};