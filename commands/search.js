const {
  InteractionCollector,
  MessageSelectMenu,
  MessageButton,
  MessageActionRow
} = require("discord.js");
const YouTube = require("youtube-sr").default;

module.exports = {
  name: "search",
  description: "搜尋影片來播放",
  register: true,
  slash: {
    name: "search",
    description: "搜尋影片來播放",
    options: [
      {
        name: "搜尋字串",
        description: "在Youtube上的搜尋字串",
        type: "STRING",
        required: true
      }
    ]
  },
  slashReply: false,
  async execute(message, args) {
    if (!message.member.voice.channel) return message.reply("❌ ┃ 你必須先加入一個語音頻道!").catch(console.error);

    const search = args.join(" ");

    let results = null;
    let options = null;

    try {
      results = await YouTube.search(search, {
        limit: 9,
        safeSearch: true,
        type: "video"
      });
    } catch (error) {
      message.client.log(error.message, "error");
      let errorMsg = null;
      if (error.message.includes("404") || error.message.includes("id")) {
        errorMsg = "❌ ┃ 找不到影片";
      } else if (error.message.includes("private") || error.message.includes("403")) {
        errorMsg = "❌ ┃ 無法播放私人影片";
      } else if (error.message.includes("429")) {
        if (message.slash) message.slash.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...");
        else message.channel.send("❌ ┃ 發生Youtube API錯誤，機器人將會自動重新啟動...").catch(console.error);

        if (process.env.HEROKU_API_KEY && process.env.HEROKU_APP_ID) require("heroku-restarter")(process.env["HEROKU_API_KEY"], process.env["HEROKU_APP_ID"]).restart();
        else process.exit(1);
      } else {
        errorMsg = "❌ ┃ 發生了未知的錯誤，此錯誤已被紀錄";
      }
      return message.followUp(errorMsg).catch(console.error);
    }
    results.map((song, index) => {
      options.push({
        label: `[${index + 1}]`,
        description: song.title.length > 50 ? `${song.title.substr(0, 47)}...` : song.title,
        value: (index + 1).toString()
      });
    });
    let menu = new MessageSelectMenu()
      .setCustomId("searchMenu")
      .setPlaceholder(`${search}的搜尋結果`)
      .addOptions(...options);
    let component = new MessageActionRow()
      .addComponents(menu);

    let sent = message.reply("<:music_search:827735016254734346> ┃ 搜尋結果:", {
      components: [component]
    }).catch(console.error);

    let timeout = false;

    let collector = new InteractionCollector(message.client, {
      message: sent,
      interactionType: "MESSAGE_COMPONENT",
      time: 30000
    });

    collector.on("collect", interaction => {
      if (interaction.user.id !== message.user.id) return interaction.reply({
        content: "❌ ┃ 你不是發送指令的那個人!",
        ephemeral: true
      });
    });
  }
};