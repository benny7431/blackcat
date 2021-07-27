module.exports = {
  canModifyQueue(member) {
    const { channel } = member.voice;
    const botChannel = member.guild.me.voice.channel;
    const queue = member.client.queue.get(member.guild.id);

    if (channel.id !== botChannel.id && member.id !== "669194742218752070") {
      queue.textChannel.send(`❌ ┃ <@${member.id}>你必須先加入一個語音頻道，或跟我在同一個頻道裡!`).then(sent => {setTimeout(function(){sent.delete().catch(console.error);},3000);});
      return false;
    }

    return true;
  },
  async restartDynos(client) {
    const ytdl = require("ytdl-core");
    
    try {
      let testSong = await ytdl.getInfo("https://youtu.be/lK-i-Ak0EAE")
    } catch (e) {
      let headers = {
        "Accept": "application/vnd.heroku+json; version=3",
        "Authorization": `Bearer ${process.env.HEROKU_API_KEY}`
      };
      fetch(`https://api.heroku.com/apps/${process.env.HEROKU_APP_ID}/dynos`, {
        method: "delete",
        headers
      });
    }
  }
};
