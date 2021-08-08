const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const ytdl = require("ytdl-core");
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
      filter: []
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
    this.ffmpeg = null;
    this.volumeTransformer = null;

    // Controller
    this.collector = null;
  }

  /**
   * Start player
   */
  start() {
    return new Promise(async (reslove, reject) => {
      this.audioPlayer.on("stateChange", (oldState, newState) => {
        this.client.log(`${this.guild.name} State changed ${oldState.status} => ${newState.status}`);
        if (newState.status === voice.AudioPlayerStatus.Idle && oldState.status !== voice.AudioPlayerStatus.Idle) {
          this.opus?.destroy();
          this.ffmpeg?.destroy();
          this.volumeTransformer?.destroy();
          this.stream?.destroy();
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

      this.behavior.playing = true;
      try {
        if (this.voiceChannel.type === "GUILD_STAGE_VOICE" && !this.voiceChannel.stageInstance) {
          await this.voiceChannel.createStageInstance({
            topic: "即將開始播放音樂...",
            privacyLevel: "GUILD_ONLY"
          });
          await this.voiceChannel.guild.me.voice.setSuppressed(false);
        }
      } catch {
        this.destroy();
        reject();
      }
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
    this.text.send("👌 ┃ 播放完畢");
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
    if (this.collector) this.collector.stop();
    this.songList = [];
    this.audioPlayer.stop();
    if (this.voiceChannel.stageInstance) this.voiceChannel.stageInstance.delete();
    this.connection.destroy();
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
    let encoderArgs = [
      "-analyzeduration", "0",
      "-loglevel", "0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
    ];
    if (this.behavior.filter.length !== 0) encoderArgs = encoderArgs.concat(["-af", this.behavior.filter.join(",")]);
    else encoderArgs.push("-af", "bass=g=2.5");

    this.stream = ytdl(url, {
      highWaterMark: 1048576 * 32
    });
    this.ffmpeg = new FFmpeg({
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
    this.stream
      .pipe(this.ffmpeg)
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
    this.audioResource = voice.createAudioResource(this.stream, {
      inputType: voice.StreamType.Opus
    });
    this.audioPlayer.play(this.audioResource);
    if (this.voiceChannel.type === "GUILD_STAGE_VOICE") this.voiceChannel.stageInstance
      .setTopic(`正在播放 - ${this.now.title.substr(0, 112)}`)
      .catch((error) => {
        console.log(error.message);
        this.voiceChannel.stageInstance
          .setTopic("正在播放音樂")
          .catch(console.error);
      });

    let embed = new Discord.MessageEmbed()
      .setColor("BLURPLE")
      .setTitle("開始播放歌曲!")
      .setDescription(
        `<:music:825646714404077569> ┃ 正在播放 [${song.title}](${song.url})` +
        "\n\n[在網頁上控制](https://app.blackcatbot.tk/?server=" + this.text.guild.id + ")")
      .setThumbnail(song.thumbnail)
      .setFooter(`由${song.by}點播`);

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
            this.behavior.playing = !this.behavior.playing;
            this.pause();
            btn.reply({
              content: "<:pause:827737900359745586> ┃ 歌曲暫停!",
              ephemeral: true
            }).catch(console.error);
          } else {
            this.behavior.playing = !this.behavior.playing;
            this.resume();
            btn.reply({
              content: "<:play:827734196243398668> ┃ 繼續播放歌曲!",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "mute":
          if (this.behavior.volume <= 0) {
            this.behavior.volume = 60;
            this.volumeTransformer.setVolumeLogarithmic(60 / 100);
            btn.reply({
              content: "<:vol_up:827734772889157722> ┃ 解除靜音音樂",
              ephemeral: true
            }).catch(console.error);
          } else {
            this.behavior.volume = 0;
            this.volumeTransformer.setVolumeLogarithmic(0);
            btn.reply({
              content: "<:mute:827734384606052392> ┃ 靜音音樂",
              ephemeral: true
            }).catch(console.error);
          }
          break;

        case "vol_down":
          if (this.behavior.volume - 10 <= 0) this.behavior.volume = 0;
          else this.behavior.volume = this.behavior.volume - 10;
          this.volumeTransformer.setVolumeLogarithmic(this.behavior.volume / 100);
          btn.reply({
            content: `<:vol_down:827734683340111913> ┃ 音量下降，目前音量: ${this.behavior.volume}%`,
            ephemeral: true
          }).catch(console.error);
          break;

        case "vol_up":
          if (this.behavior.volume + 10 >= 100) this.behavior.volume = 100;
          else this.behavior.volume = this.behavior.volume + 10;
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
  }
}

module.exports = Player;