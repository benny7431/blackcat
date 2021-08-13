const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const { getInfo } = require("ytdl-core");
const { opus, FFmpeg, VolumeTransformer } = require("prism-media");
const { canModifyQueue } = require("../util/Util");

class Player {
  /**
   * @param {Discord.VoiceChannel} channel Server voice channel
   * @param {Discord.TextChannel} textChannel Server text channel
   * @param {Discord.Client} client Discord.js Client
   */
  constructor(channel, textChannel, client) {
    // Client
    this.client = client;

    // Song list
    this.songList = [];
    this.now = null;

    // Song behavior
    this.behavior = {
      volume: 60,
      playing: true,
      loop: false,
      repeat: false,
      muted: false,
      filter: [],
      mutedVolume: null
    };

    // Player
    this.audioPlayer = voice.createAudioPlayer();

    // Voice connection
    this.connection = voice.joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this.voiceChannel = channel;
    this.connection.subscribe(this.audioPlayer);

    // YTDL stream
    this.stream = null;

    // Encoded stream
    this.encoded = null;

    // Audio resource
    this.audioResource = null;

    // Text channel
    this.text = textChannel;

    // Guild (From text channel)
    this.guild = textChannel.guild;

    // Error events
    this.connection.on(voice.VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          voice.entersState(this.connection, voice.VoiceConnectionStatus.Signalling, 7000),
          voice.entersState(this.connection, voice.VoiceConnectionStatus.Connecting, 7000),
        ]);
      } catch (error) {
        this.client.players.delete(this.text.guildId);
        this.connection.destroy();
        if (this.collector) this.collector.stop();
        this.text.send("🎈 ┃ 語音頻道連結斷開，音樂已停止");
      }
    });

    // Converts
    this.opus = null;
    this.volumeTransformer = null;

    // Controller
    this.collector = null;

    // Lock vers
    this.disconnected = false;
  }

  /**
   * Start player
   */
  start() {
    return new Promise(async (reslove, reject) => {
      this.behavior.playing = true;
      try {
        if (this.voiceChannel.stageInstance) this.voiceChannel.stageInstance.delete()
        if (this.voiceChannel.type === "GUILD_STAGE_VOICE") {
          await this.voiceChannel.createStageInstance({
            topic: "🎵 Loading...",
            privacyLevel: "GUILD_ONLY"
          });
          await this.voiceChannel.guild.me.voice.setSuppressed(false);
        } else if (this.voiceChannel.stageInstance) {
          await this.voiceChannel.guild.me.voice.setSuppressed(false);
        }
      } catch {
        this.destroy();
        reject();
      }
      this.audioPlayer.on("stateChange", (oldState, newState) => {
        this.client.log(`${this.guild.name} State changed ${oldState.status} => ${newState.status}`);
      });
      this._getStream(this.songList[0].url);
      reslove();
    });
  }

  /**
   * Add songs
   * @param {Object[]} songs Array of song data
   */
  add(songs) {
    songs.forEach(song => {
      this.songList.push(song);
    });
  }

  /**
   * Skip current song
   */
  skip() {
    this.behavior.playing = true;
    this.collector?.stop();
    if (this.behavior.loop) {
      let lastSong = this.songList.shift();
      this.songList.push(lastSong);
    } else if (!this.behavior.repeat) {
      this.songList.shift();
    }
    if (this.songList.length <= 0) {
      this.stop();
    }
    this._getStream(this.songList[0].url);
  }

  /**
   * Pause player
   */
  pause() {
    this.behavior.playing = false;
    this.audioPlayer.pause();
  }

  /**
   * Chnage current volume
   * @param {Number} volume Volume
   */
  setVolume(volume) {
    this.behavior.volume = volume;
    this.volumeTransformer.setVolumeLogarithmic(volume / 100);
  }

  /**
   * Resume paused song
   */
  resume() {
    this.audioPlayer.unpause();
  }

  /**
   * Stop player
   */
  stop() {
    this.text.send("👌 ┃ 播放清單播放完畢");
    this.destroy();
  }

  /**
   * Loop music
   * @param {Boolean} value Value
   */
  toggleLoop(value = !this.behavior.loop) {
    this.behavior.repeat = false;
    this.behavior.loop = value;
  }

  /**
   * Destroy voice connection
   */
  destroy() {
    this.opus?.destroy();
    this.volumeTransformer?.destroy();
    this.stream?.destroy();
    this.encoded?.destroy();
    this.collector?.stop();
    this.songList = [];
    this.audioPlayer.stop();
    if (this.voiceChannel.stageInstance) this.voiceChannel.stageInstance.delete();
    if (!this.disconnected) this.connection.destroy();
    this.disconnected = true;
    this.client.players.delete(this.text.guildId);
    this.client.log(`${this.guild.name} Queue ended`);
  }

  /**
   * Repeat music
   * @param {Boolean} value Value
   */
  toggleRepeat(value = !this.behavior.repeat) {
    this.behavior.loop = false;
    this.behavior.repeat = value;
  }

  /**
   * Get song list
   */
  get songs() {
    return this.songList;
  }

  /**
   * Modify song list
   */
  set songs(songs) {
    this.songList = songs;
  }


  /**
   * Get filters
   */
  get filter() {
    return this.behavior.filter;
  }

  /**
   * Set filter
   * @param {String[]} filterArray Filters
   */
  set filter(filterArray) {
    this.behavior.filter = filterArray;
  }

  /**
   * Get now play time
   */
  get playTime() {
    return this.audioResource.playbackDuration / 1000;
  }

  /**
   * Get queue text channel
   */
  get textChannel() {
    return this.text;
  }

  /**
   * Get current playing
   */
  get current() {
    return this.now;
  }

  /**
   * Check is music playing
   */
  get playing() {
    return this.behavior.playing;
  }

  /**
   * Get repeat status
   */
  get repeat() {
    return this.behavior.repeat;
  }

  /**
   * Get loop status
   */
  get loop() {
    return this.behavior.loop;
  }

  /**
   * Get audio stream and play it
   * @private
   * @param {String} url YouTube video URL
   */
  async _getStream(url) {
    this.client.log(`${this.guild.name} Getting stream`);
    this.now = this.songList[0];

    let videoInfo = null;
    let streamUrl = null;
    try {
      videoInfo = await getInfo(url);
    } catch (error) {
      if (error.message.includes("private") || error.message.includes("403")) {
        this.text.send("❌ ┃ 無法播放私人影片");
      } else if (error.message.includes("429")) {
        this.text.send("❌ ┃ 發生YouTube API錯誤...");
      } else if (error.message.includes("404")) {
        this.text.send("❌ ┃ 找不到影片或YouTube API已更新，請等待機器人更新!");
      } else {
        this.text.send("❌ ┃ 發生未知的錯誤");
      }

      this.client.log(`${this.guild.name} ${error.message}`);
      this.skip();
    }
    let matchUrl = null;
    let found = false;
    videoInfo.formats.forEach(streamUrl => {
      if (found) return;
      if (streamUrl.hasAudio) {
        found = true;
        matchUrl = streamUrl.url;
      }
    });

    let encoderArgs = [
      "-reconnect", "1",
      "-reconnect_at_eof", "1",
      "-reconnect_streamed", "1",
      "-reconnect_delay_max", "5",
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-i", matchUrl,
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
      "-b:a", "192k"
    ];
    if (this.behavior.filter.length !== 0) {
      encoderArgs = encoderArgs.concat(["-af", this.behavior.filter.join(",")]);
    }
    else {
      encoderArgs.push("-af", "bass=g=2.5");
    }

    this.stream = new FFmpeg({
      args: encoderArgs
    });
    this.volumeTransformer = new VolumeTransformer({
      type: "s16le",
      volume: this.behavior.volume / 100
    });
    this.opus = new opus.Encoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    });
    this.encoded = this.stream
      .pipe(this.volumeTransformer)
      .pipe(this.opus);
    this._playStream();
  }

  /**
   * Play stream
   * @private
   * @param {Readable} stream Stream to play
   */
  async _playStream(stream) {
    this.client.log(`${this.guild.name} Start playing stream`);
    let song = this.songList[0];
    this.audioResource = voice.createAudioResource(this.encoded, {
      inputType: voice.StreamType.Opus
    });
    this.audioPlayer.play(this.audioResource);
    this.volumeTransformer.setVolumeLogarithmic(this.behavior.volume / 100);
    if (this.voiceChannel.type === "GUILD_STAGE_VOICE") this.voiceChannel.stageInstance
      .setTopic(`🎵 目前播放: ${this.now.title.substr(0, 110)}`)
      .catch((error) => {
        console.log(error.message);
        this.voiceChannel.stageInstance
          .setTopic("🎵 音樂播放中!")
          .catch(console.error);
      });

    let embed = new Discord.MessageEmbed()
      .setColor("BLURPLE")
      .setTitle("🎵 音樂已開始")
      .setDescription(`<:music:825646714404077569> ┃ 正在播放 [${Discord.Util.escapeMarkdown(song.title)}](${song.url})`)
      .setThumbnail(song.thumbnail)
      .addField("🔊 ┃ 目前音量", `${this.behavior.volume}%`, true);
    if (this.behavior.loop) {
      embed.addField("🔁 ┃ 全部重複", "將會重複所有歌曲", true);
    }
    if (this.behavior.repeat) {
      embed.addField("🔂 ┃ 單曲重複", "將會重複目前播放的歌曲", true);
    }
    embed.addField("🕒 ┃ 歌曲長度", new Date(song.duration * 1000).toISOString().substr(11, 8), true);
    embed.addField("❓ ┃ 點歌者", Discord.Util.escapeMarkdown(song.by), true);
    embed.addField("🎛️ ┃ 網頁面板", `https://app.blackcatbot.tk/?server=${this.text.guildId}`, true);

    let skipBtn = new Discord.MessageButton()
      .setLabel("跳過")
      .setStyle("PRIMARY")
      .setEmoji("827734282318905355")
      .setCustomId("skip");
    let pauseBtn = new Discord.MessageButton()
      .setLabel("暫停")
      .setStyle("PRIMARY")
      .setEmoji("827737900359745586")
      .setCustomId("pause");
    let stopBtn = new Discord.MessageButton()
      .setLabel("停止")
      .setStyle("DANGER")
      .setEmoji("827734840891015189")
      .setCustomId("stop");
    let volupBtn = new Discord.MessageButton()
      .setLabel("上升")
      .setStyle("SUCCESS")
      .setEmoji("827734772889157722")
      .setCustomId("vol_up");
    let muteBtn = new Discord.MessageButton()
      .setLabel("靜音")
      .setStyle("SUCCESS")
      .setEmoji("827734384606052392")
      .setCustomId("mute");
    let voldownBtn = new Discord.MessageButton()
      .setLabel("下降")
      .setStyle("SUCCESS")
      .setEmoji("827734683340111913")
      .setCustomId("vol_down");
    let playControl = new Discord.MessageActionRow()
      .addComponents(skipBtn)
      .addComponents(pauseBtn)
      .addComponents(stopBtn);
    let volumeControl = new Discord.MessageActionRow()
      .addComponents(voldownBtn)
      .addComponents(muteBtn)
      .addComponents(volupBtn);

    let controller = await this.text.send({
      embeds: [embed],
      components: [playControl, volumeControl]
    });

    this.collector = controller.createMessageComponentCollector();
    this.collector.on("collect", async btn => {
      const member = btn.member;
      if (!canModifyQueue(member)) return btn.reply({
        content: "❌ ┃ 請加入語音頻道!",
        ephemeral: true
      });

      switch (btn.customId) {
        case "skip":
          this.behavior.playing = true;
          this.skip();
          btn.reply({
            content: "<:skip:827734282318905355> ┃ 跳過歌曲",
            ephemeral: true
          }).catch(console.error);
          break;

        case "pause":
          if (this.behavior.playing) {
            pauseBtn
              .setLabel("繼續")
              .setEmoji("827734196243398668");
            playControl = new Discord.MessageActionRow()
              .addComponents(skipBtn)
              .addComponents(pauseBtn)
              .addComponents(stopBtn);
            controller.edit({
              embeds: [embed],
              components: [playControl, volumeControl]
            }).catch(console.error);
            this.behavior.playing = !this.behavior.playing;
            this.pause();
            btn.reply({
              content: "<:pause:827737900359745586> ┃ 歌曲暫停!",
              ephemeral: true
            }).catch(console.error);
          } else {
            pauseBtn
              .setLabel("暫停")
              .setEmoji("827737900359745586");
            playControl = new Discord.MessageActionRow()
              .addComponents(skipBtn)
              .addComponents(pauseBtn)
              .addComponents(stopBtn);
            controller.edit({
              embeds: [embed],
              components: [playControl, volumeControl]
            }).catch(console.error);
            this.behavior.playing = !this.behavior.playing;
            this.resume();
            btn.reply({
              content: "<:play:827734196243398668> ┃ 繼續播放歌曲!",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "mute":
          if (this.behavior.muted) {
            this.behavior.volume = this.behavior.mutedVolume;
            this.behavior.mutedVolume = null;
            this.behavior.muted = false;
            this.volumeTransformer.setVolumeLogarithmic(60 / 100);
            if (this.behavior.volume !== 100) volupBtn.setDisabled(true);
            else volupBtn.setDisabled(false);
            if (this.behavior.volume !== 0) voldownBtn.setDisabled(true);
            else voldownBtn.setDisabled(false);
            muteBtn.setLabel("靜音");
            volumeControl = new Discord.MessageActionRow()
              .addComponents(voldownBtn)
              .addComponents(muteBtn)
              .addComponents(volupBtn);
            controller.edit({
              embeds: [embed],
              components: [playControl, volumeControl]
            }).catch(console.error);
            btn.reply({
              content: "<:vol_up:827734772889157722> ┃ 解除靜音音樂",
              ephemeral: true
            }).catch(console.error);
          } else {
            this.behavior.muted = true;
            this.behavior.mutedVolume = this.behavior.volume;
            this.behavior.volume = 0;
            this.volumeTransformer.setVolumeLogarithmic(0);
            volupBtn.setDisabled(true);
            voldownBtn.setDisabled(true);
            muteBtn.setLabel("解除靜音");
            volumeControl = new Discord.MessageActionRow()
              .addComponents(voldownBtn)
              .addComponents(muteBtn)
              .addComponents(volupBtn);
            controller.edit({
              embeds: [embed],
              components: [playControl, volumeControl]
            }).catch(console.error);
            btn.reply({
              content: "<:mute:827734384606052392> ┃ 靜音音樂",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "vol_down":
          if (this.behavior.volume - 10 <= 0) {
            this.behavior.volume = 0;
            voldownBtn.setDisabled(true);
          }
          else this.behavior.volume = this.behavior.volume - 10;
          volupBtn.setDisabled(false);
          volumeControl = new Discord.MessageActionRow()
            .addComponents(voldownBtn)
            .addComponents(muteBtn)
            .addComponents(volupBtn);
          controller.edit({
            embeds: [embed],
            components: [playControl, volumeControl]
          }).catch(console.error);
          this.volumeTransformer.setVolumeLogarithmic(this.behavior.volume / 100);
          btn.reply({
            content: `<:vol_down:827734683340111913> ┃ 音量下降，目前音量: ${this.behavior.volume}%`,
            ephemeral: true
          }).catch(console.error);
          break;

        case "vol_up":
          if (this.behavior.volume + 10 >= 100) {
            this.behavior.volume = 100;
            volupBtn.setDisabled(true);
          }
          else this.behavior.volume = this.behavior.volume + 10;
          voldownBtn.setDisabled(false);
          volumeControl = new Discord.MessageActionRow()
              .addComponents(voldownBtn)
              .addComponents(muteBtn)
              .addComponents(volupBtn);
            controller.edit({
              embeds: [embed],
              components: [playControl, volumeControl]
            }).catch(console.error);
          this.volumeTransformer.setVolumeLogarithmic(this.behavior.volume / 100);
          btn.reply({
            content: `<:vol_up:827734772889157722> ┃ 音量上升，目前音量: ${this.behavior.volume}%`,
            ephemeral: true
          }).catch(console.error);
          break;

        case "stop":
          this.stop();
          btn.reply({
            content: "<:stop:827734840891015189> ┃ 歌曲停止!",
            ephemeral: true
          }).catch(console.error);
          break;
      }
    });

    this.collector.on("end", async () => {
      controller.delete().catch(console.error);
    });

    this.audioPlayer.on("stateChange", (oldState, newState) => {
      if (newState.status === voice.AudioPlayerStatus.Idle && oldState.status !== voice.AudioPlayerStatus.Idle) {
        this.audioPlayer.removeAllListener();
        this.opus?.destroy();
        this.volumeTransformer?.destroy();
        this.stream?.destroy();
        this.encoded?.destroy();
        this.audioResource = null;
        this.collector.stop();
        if (this.behavior.loop) {
          let lastSong = this.songList.shift();
          this.songList.push(lastSong);
        } else if (!this.behavior.repeat) {
          this.songList.shift();
        }
        if (this.songList.length === 0) {
          this.stop();
        } else {
          this._getStream(this.songList[0].url);
        }
      }
    });
  }
}

module.exports = Player;
