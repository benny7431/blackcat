const { canModifyQueue } = require("../util/Util");

module.exports = {
  name: "resume",
  aliases: ["r"],
  description: "繼續播放被暫停的歌曲",
  register: true,
  slash: {
    name: "resume",
    description: "繼續播放被暫停的歌曲",
  },
  slashReply: true,
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return message.channel.send("❌ ┃ 目前沒有任何歌曲正在播放").catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (!queue.playing) {
      queue.resume();
      return queue.textChannel.send("<:play:827734196243398668> ┃ 繼續播放歌曲").catch(console.error);
    }

    if(message.slash) return message.slash.send("❌ ┃ 歌曲已經在播放了")
      .catch(console.error);
    else return message.channel.send("❌ ┃ 歌曲已經在播放了")
      .catch(console.error);
  }
};