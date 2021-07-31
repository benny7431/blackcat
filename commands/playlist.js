const { MessageEmbed, Permissions, Util } = require("discord.js");
const { play } = require("../include/play");
const YouTube = require("youtube-sr").default;

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
        type: 3,
        required: true,
      }
    ]
  },
  slashReply: true,
  async execute(message, args) {
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue)
      if (serverQueue.songs[0].type === "radio") {
        if (message.slash.raw) return message.slash.send("❌ ┃ 你不能在連結至電台的狀態下播放其他歌曲!");
        else return message.channel.send("❌ ┃ 你不能在連結至電台的狀態下播放其他歌曲!").catch(console.error);
      }
    if (serverQueue && channel !== message.guild.me.voice.channel) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 你必須跟我在同一個頻道裡面!");
      else return message.channel.send("❌ ┃ 你必須跟我在同一個頻道裡面!").catch(console.error);
    }

    if (!args.length) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 請輸入播放清單名稱或網址!");
      else return message.channel.send("❌ ┃ 請輸入播放清單名稱或網址!").catch(console.error);
    }
    if (!channel) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 你要先加入一個語音頻道...不然我要在哪的房間放收音機呢？");
      else return message.channel.send("❌ ┃ 你要先加入一個語音頻道...不然我要在哪的房間放收音機呢？").catch(console.error);
    }

    if (!channel.joinable) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!").catch(console.error);
      else return message.channel.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!").catch(console.error);
    }
    if (!channel.speakable) {
      if (message.slash.raw) return message.slash.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!");
      else return message.channel.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!");
    }

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      repeat: false,
      volume: 80,
      playing: true,
      filter: [],
      current: null,
      previous: null,
      stream: null
    };

    let song = null;
    let playlist = null;
    let videos = [];

    let playlistEmbed = new MessageEmbed()
      .setTitle("正在讀取播放清單, 請稍等...")
      .setColor("#5865F2");

    let sent = null;
    if (message.slash.raw) message.slash.sendEmbed(playlistEmbed);
    else sent = await message.channel.send(playlistEmbed);

    if (urlValid) {
      try {
        playlist = await YouTube.getPlaylist(url);
        videos = await playlist.fetch();
      } catch (error) {
        console.error(error);
        if (message.slash.raw) return message.slash.send("❌ ┃ 沒有找到播放清單");
        else return message.channel.send("❌ ┃ 沒有找到播放清單").catch(console.error);
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
        if (message.slash.raw) return message.slash.send("❌ ┃ 沒有找到播放清單...");
        else return message.channel.send("❌ ┃ 沒有找到播放清單...").catch(console.error);
      }
    }

    videos.videos.forEach((video) => {
      song = {
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration / 1000,
        thumbnail: video.thumbnail.url,
        type: "playlist_song",
        by: message.author.username
      };

      if (serverQueue) {
        serverQueue.songs.push(song);
      } else {
        queueConstruct.songs.push(song);
      }
    });

    playlistEmbed
      .setTitle(`${playlist.title}`)
      .setURL(playlist.url)
      .setDescription(`\n<:music_add:827734890924867585> ┃ 已新增${playlist.videoCount}首歌`)
      .setColor("#5865F2")
      .setThumbnail(playlist.thumbnail.url);
    if (sent) sent.edit({
      embed: playlistEmbed
    });
    else message.slash.editEmbed(embed);

    if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

    if (!serverQueue) {
      try {
        queueConstruct.connection = await channel.join();
        await queueConstruct.connection.voice.setSelfDeaf(true);
        await message.channel.send(`<:joinvc:866176795471511593> ┃ 已加入\`${Util.escapeMarkdown(channel.name)}\`並將訊息發送至<#${message.channel.id}>`);
        play(queueConstruct.songs[0], message);
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`❌ ┃ 無法加入語音頻道...原因: ${error.message}`).catch(console.error);
      }
    }
  }
};
