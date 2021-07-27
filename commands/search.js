const { MessageEmbed } = require("discord.js");
const { MessageMenu, MessageMenuOption, MessageActionRow } = require("discord-buttons");
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
        type: 3,
        required: true,
      }
    ]
  },
  async execute(message, args) {
    if (!args.length)
      return message.channel.send("❌ ┃ 請輸入歌曲名稱").catch(console.error);
    if (!message.member.voice.channel)
      return message.channel.send("❌ ┃ 你必須先加入一個語音頻道!").catch(console.error);

    const search = args.join(" ");

    try {
      let options = [];
      const results = await YouTube.search(search, {
        limit: 9,
        safeSearch: true,
        type: "video"
      });
      results.map((song, index) => {
        options.push(new MessageMenuOption()
          .setLabel(`[${index + 1}]`)
          .setDescription(song.title.length > 50 ? `${song.title.substr(0, 47)}...` : song.title)
          .setValue(index + 1))
      });
      options.push(new MessageMenuOption()
        .setLabel("取消")
        .setValue("cancel"))
      let menu = new MessageMenu()
        .setID("searchMenu")
        .setPlaceholder(`${search}的搜尋結果`)
        .addOptions(...options);
      let select = new MessageActionRow().addComponent(menu);

      const filter = (interaction) => interaction.clicker.id === message.author.id
      let resultsMessage = await message.channel.send("<:music_search:827735016254734346> ┃ 搜尋結果:", {
        components: select
      });
      try {
        let collector = resultsMessage.createMenuCollector(filter, { max: 1, time: 30000, errors: ["time"] });

        let choiceIndex = null;
        collector.on("collect", async (choice) => {
          choice.reply.defer();
          switch (choice.values[0]) {
            case "1":
              choiceIndex = 1;
              break;
            case "2":
              choiceIndex = 2;
              break;
            case "3":
              choiceIndex = 3;
              break;
            case "4":
              choiceIndex = 4;
              break;
            case "5":
              choiceIndex = 5;
              break;
            case "6":
              choiceIndex = 6;
              break;
            case "7":
              choiceIndex = 7;
              break;
            case "8":
              choiceIndex = 8;
              break;
            case "9":
              choiceIndex = 9;
              break;
            case "cancel":
              choiceIndex = 0;
          }
        });
        collector.on("end", () => {
          if (choiceIndex !== 0 && choiceIndex) {
            let choice = `https://youtu.be/${results[choiceIndex - 1].id}`;
            message.client.commands.get("play").execute(message, [choice]);
          }
          resultsMessage.delete().catch(console.error);
        });
      } catch (e) {
        console.log(e);
        resultsMessage.delete();
      }
    } catch (error) {
      message.channel.send("❌ 搜尋時發生錯誤!");
      console.error(error);
    }
  }
};