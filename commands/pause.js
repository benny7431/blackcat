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