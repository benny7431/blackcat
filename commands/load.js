const ytdl = require("ytdl-core");
const Player = require("../include/player");
const { Permissions, Util } = require("discord.js");

module.exports = {
  name: "load",
  description: "讀取清單",
  register: false,
  async execute(message, args) {
    const { channel } = message.member.voice;

    if (!channel) return message.channel.send("❌ ┃ 你要先加入一個語音頻道...不然我要在哪的房間放收音機呢？").catch(console.error);

    if (!channel.joinable) return message.channel.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!").catch(console.error);
    if (!channel.speakable) return message.channel.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!");
    if (serverQueue && channel !== message.guild.me.voice.channel) return message.channel.send("❌ ┃ 你必須跟我在同一個頻道裡面!").catch(console.error);

    const serverQueue = message.client.queue.get(message.guild.id);
    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      repeat: false,
      volume: 60,
      playing: true,
      filter: [],
      current: null,
      player: null,
      audioPlayer: null,
      converter: {
        ffmpeg: null,
        opus: null,
        volume: null
      }
    };
    const songs = await message.client.db.get(`stored.${args.length && args[0] !== "" ? args[0] : message.author.id}`);
    message.client.log(message, "Load queue", false, "info");
    if (!Array.isArray(songs)) return message.channel.send("❌ ┃ 你尚未儲存歌單，或是輸入了錯誤的ID!").catch(console.error);
    let sent = await message.channel.send(`<:load:833271811666870282> ┃ 正在讀取${songs.length}首歌曲`).catch(console.error);
    songs.forEach(async song => {
      let songData = {
        title: song.title,
        url: song.url,
        type: "loaded_song",
        by: message.author.username
      };
      if (serverQueue) serverQueue.songs.push(songData);
      else queueConstruct.songs.push(songData);
    });
    message.channel.send(`<:load:833271811666870282> ┃ 已讀取${songs.length}首歌曲`).catch(console.error);
    if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

    if (!serverQueue) {
      try {
        queueConstruct.player = new Player(queueConstruct, message.client);
        queueConstruct.player.connect(channel);
        await message.channel.send(`<:joinvc:866176795471511593> ┃ 已加入\`${Util.escapeMarkdown(channel.name)}\`並將訊息發送至<#${message.channel.id}>`);
        queueConstruct.player.play(queueConstruct.songs[0]);
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`❌ ┃ 無法加入語音頻道...原因: ${error.message}`).catch(console.error);
      }
    }
  }
};