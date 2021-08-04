const YouTube = require("youtube-sr").default;
const Player = require("../include/player");
const { v4: uuid } = require("uuid");
const { MessageEmbed, Permissions, Util } = require("discord.js");

module.exports = {
  name: "playlist",
  cooldown: 3,
  aliases: ["pl"],
  description: "播放Youtube的播放清單",
  register: true,
  slash: {
    name: "playlist",
    description: "播放Youtube的播放清單",
    options: [
      {
        name: "網址或搜尋文字",
        description: "在Youtube上的網址或搜尋字串",
        type: "STRING",
        required: true,
      }
    ]
  },
  slashReply: true,
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    if (!channel) {
      if (message.slash) return message.slash.send("❌ ┃ 你要先加入一個語音頻道...不然我要在哪的房間放收音機呢？")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 你要先加入一個語音頻道...不然我要在哪的房間放收音機呢？")
        .catch(console.error);
    }
    if (serverQueue && channel !== message.guild.me.voice.channel) {
      if (message.slash) return message.slash.send("❌ ┃ 你必須跟我在同一個頻道裡面!")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 你必須跟我在同一個頻道裡面!")
        .catch(console.error);
    }

    if (!args.length) {
      if(message.slash) return message.slash.send("❌ ┃ 請輸入歌曲名稱或網址")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 請輸入歌曲名稱或網址")
        .catch(console.error);
    }
    if (!channel.joinable) {
      if(message.slash) return message.slash.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!")
        .catch(console.error);
    }
    if (!channel.speakable && channel.type === "GUILD_VOICE") {
      if(message.slash) return message.slash.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!")
        .catch(console.error);
    }

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);

    let song = null;
    let playlist = null;
    let videos = [];

    let playlistEmbed = new MessageEmbed()
      .setTitle("正在讀取播放清單, 請稍等...")
      .setColor("BLURPLE");

    let sent = null;
    if (message.slash) await message.slash.send({
      embeds: [playlistEmbed]
    }).catch(console.error);
    else sent = await message.channel.send({
      embeds: [playlistEmbed]
    }).catch(console.error);

    if (urlValid) {
      try {
        playlist = await YouTube.getPlaylist(url);
        videos = await playlist.fetch();
      } catch (error) {
        console.error(error);
        return message.channel.send("❌ ┃ 沒有找到播放清單").catch(console.error);
      }
    } else {
      try {
        const results = await YouTube.search(search, {
          safeSearch: true,
          type: "playlist"
        });
        playlist = await YouTube.getPlaylist(results[0].url);
        videos = await playlist.fetch();
      } catch (error) {
        console.error(error);
        return message.channel.send("❌ ┃ 沒有找到播放清單...").catch(console.error);
      }
    }
    
    let songList = [];

    videos.videos.forEach((video) => {
      let songId = uuid();
      song = {
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration / 1000,
        thumbnail: video.thumbnail.url,
        type: "playlist_song",
        by: message.author.username,
        songId
      };
      songList.push(song);
    });

    playlistEmbed
      .setTitle(`${playlist.title}`)
      .setURL(playlist.url)
      .setDescription(`\n<:music_add:827734890924867585> ┃ 已新增${playlist.videoCount}首歌`)
      .setColor("BLURPLE")
      .setThumbnail(playlist.thumbnail.url);
    if(sent) sent.edit({
      embeds: [playlistEmbed]
    }).catch(console.error);
    else message.slash.edit({
      embeds: [playlistEmbed]
    }).catch(console.error);

    if (!serverQueue) {
      try {
        let player = new Player(channel, message.channel, message.client);
        message.client.queue.set(message.guild.id, player);
        player.add(songList)
        message.channel.send(`<:joinvc:866176795471511593> ┃ 已加入\`${Util.escapeMarkdown(channel.name)}\`並將訊息發送至<#${message.channel.id}>`);
        player.start();
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`❌ ┃ 無法加入語音頻道...原因: ${error.message}`).catch(console.error);
      }
    } else {
      serverQueue.add(songList);
    }
  }
};