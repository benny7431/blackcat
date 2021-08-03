const ytdl = require("ytdl-core");
const YouTube = require("youtube-sr").default;
const Player = require("../include/player");
const { v4: uuid } = require("uuid");
const { MessageEmbed, Permissions, Util } = require("discord.js");

module.exports = {
  name: "play",
  cooldown: 3,
  aliases: ["p"],
  description: "播放 Youtube 的歌曲",
  register: true,
  slash: {
    name: "play",
    description: "播放 Youtube 的歌曲",
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
      if (message.slash) return message.slash.send("❌ ┃ 請輸入歌曲名稱或網址")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 請輸入歌曲名稱或網址")
        .catch(console.error)
    }

    if (!channel.joinable) {
      if (message.slash) return message.slash.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 無法連接到語音頻道!因為我沒有權限加入你在的房間!")
        .catch(console.error);
    }
    if (!channel.speakable && channel.type === "GUILD_VOICE") {
      if (message.slash) return message.slash.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!")
        .catch(console.error);
      else return message.channel.send("❌ ┃ 我沒辦法在你的語音頻道裡放收音機!因為我沒有說話的權限!")
        .catch(console.error)
    }

    if (channel.type === "GUILD_STAGE_VOICE") {
      if (!channel.manageable || !channel.permissionsFor(message.guild.me).has(Permissions.STAGE_MODERATOR)) {
        if (message.slash) return message.slash.send("❌ ┃ 我必須成為舞台頻道的主持人才可以在裡面播放音樂!")
          .catch(console.error);
        else return message.channel.send("❌ ┃ 我必須成為舞台頻道的主持人才可以在裡面播放音樂!")
          .catch(console.error);
      }
      try {
        await channel.permissionOverwrites.create(message.guild.me, {
          "STAGE_MODERATOR": true
        });
      } catch (e) {
        console.log(e);
        if (message.slash) return message.slash.send("❌ ┃ 我無法將自己設為舞台管理員，請自行設置!")
          .catch(console.error);
        else return message.slash.send("❌ ┃ 我無法將自己設為舞台管理員，請自行設置!")
          .catch(console.error);
      }
    }

    if (message.slash.raw) message.slasj.send("<:music_search:827735016254734346> ┃ 搜尋中...\n> `" + args.join(" ") + "`")
      .catch(console.error);
    else message.channel.send("<:music_search:827735016254734346> ┃ 搜尋中...\n> `" + args.join(" ") + "`")
      .catch(console.error);

    const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    if (!urlValid && playlistPattern.test(args[0])) {
      return message.client.commands.get("playlist").execute(message, args);
    }

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

    let songInfo = null;
    let song = null;

    let songId = uuid();

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.player_response.videoDetails.lengthSeconds,
          thumbnail: songInfo.videoDetails.thumbnails.pop().url,
          type: "song",
          by: message.author.username,
          songId
        };
      } catch (error) {
        message.client.log(message, error.message, false, "error");
        let errorMsg = null;
        if (error.message.includes("404") || error.message.includes("id")) {
          errorMsg = "❌ ┃ 找不到影片";
        } else if (error.message.includes("private") || error.message.includes("403")) {
          errorMsg = "❌ ┃ 無法播放私人影片";
        } else if (error.message.includes("429")) {
          if (message.slash.raw) message.slash.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...");
          else message.channel.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...").catch(console.error);

          if (process.env.HEROKU_API_KEY && process.env.HEROKU_APP_ID) require("heroku-restarter")(process.env["HEROKU_API_KEY"], process.env["HEROKU_APP_ID"]).restart();
          else process.exit(1);
        } else {
          errorMsg = "❌ ┃ 發生了未知的錯誤，此錯誤已被紀錄";
        }
        return message.channel.send(errorMsg).catch(console.error);
      }
    } else {
      try {
        const results = await YouTube.search(search, {
          safeSearch: true
        });
        songInfo = await ytdl.getInfo(`https://youtu.be/${results[0].id}`);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.player_response.videoDetails.lengthSeconds,
          thumbnail: songInfo.videoDetails.thumbnails.pop().url,
          type: "song",
          by: message.author.username,
          songId
        };
      } catch (error) {
        message.client.log(message, error.message, false, "error");
        let errorMsg = null;
        if (error.message.includes("404") || error.message.includes("id")) {
          errorMsg = "❌ ┃ 找不到影片";
        } else if (error.message.includes("private") || error.message.includes("403")) {
          errorMsg = "❌ ┃ 無法播放私人影片";
        } else if (error.message.includes("429")) {
          if (message.slash.raw) message.slash.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...");
          else message.channel.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...").catch(console.error);

          if (process.env.HEROKU_API_KEY && process.env.HEROKU_APP_ID) require("heroku-restarter")(process.env["HEROKU_API_KEY"], process.env["HEROKU_APP_ID"]).restart();
          else process.exit(1);
        } else {
          errorMsg = "❌ ┃ 發生了未知的錯誤，此錯誤已被紀錄";
        }
        return message.channel.send(errorMsg).catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      const embed = new MessageEmbed()
        .setColor("BLURPLE")
        .setTitle(`<:music_add:827734890924867585> ┃ 我已經把${song.title}加入播放清單了!`)
        .setThumbnail(song.thumbnail);

      return serverQueue.textChannel.send({
        embeds: [embed]
      }).catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.player = new Player(queueConstruct, message.client);
      if (channel.type === "GUILD_STAGE_VOICE" && !channel.stageInstance) {
        channel.createStageInstance({
          topic: "即將開始播放音樂...",
          privacyLevel: "GUILD_ONLY"
        });
      }
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
};