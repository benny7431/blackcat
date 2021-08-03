module.exports = {
  name: "filter",
  description: "變更音樂等化器",
  register: true,
  slash: {
    name: "filter",
    description: "變更音樂等化器",
    options: [
      {
        name: "動作",
        description: "要執行的動作",
        type: "STRING",
        required: true,
        choices: [
          {
            name: "add(新增)",
            value: "add"
          },
          {
            name: "remove(移除)",
            value: "remove"
          }, {
            name: "clear(清除全部)",
            value: "clear"
          }
        ]
      },
      {
        name: "等化器模式",
        description: "要新增/移除的等化器模式",
        type: "STRING",
        required: true,
        choices: [
          {
            name: "BassBoost(低音加強)",
            value: "bassboost"
          },
          {
            name: "Treble(高音加強)",
            value: "treble"
          },
          {
            name: "8D(虛擬迴旋音效)",
            value: "8D"
          },
          {
            name: "NightCore(NightCore音效)",
            value: "nightcore"
          },
          {
            name: "Vaporwave(Vaporwave音效)",
            value: "vaporwave"
          },
          {
            name: "Surrounding(虛擬環繞音效)",
            value: "surrounding"
          }, {
            name: "Subboost(Subboost音效)",
            value: "subboost"
          }
        ]
      }
    ]
  },
  slashReply: true,
  execute(message, args) {
    const queue = message.client.queue.get(message.guild.id);
    const filters = {
      "bassboost": "bass=g=7",
      "8D": "apulsator=hz=0.09",
      "nightcore": "aresample=48000,asetrate=48000*1.15",
      "vaporwave": "aresample=48000,asetrate=48000*0.8",
      "surrounding": "surround",
      "treble": "treble=g=5",
      "subboost": "asubboost"
    };
    if (!queue) return message.channel.send("❌ ┃ 現在沒有人在播放音樂欸030").catch(console.error);
    if (!args.length) return message.channel.send("❌ ┃ 請輸入動作(add/remove/clear)").catch(console.error);
    if (!args[1]) return message.channel.send("❌ ┃ 請輸入音樂音效(bassboost/8D/nightcore/vaporwave/surrounding/terble/subboost)").catch(console.error);
    const filter = filters[args[1]];
    let newFilter = [];
    let error = false;
    if (args[0] === "clear") {
      newFilter = queue.filter;
      if (newFilter.length === 0) error = true;
      else newFilter = [];
    } else if (args[0] === "add") {
      newFilter = queue.filter;
      if (newFilter.includes(filter)) error = true;
      else newFilter.push(filter);
    } else if (args[0] === "remove") {
      let editFilter = [];
      queue.filter.forEach(queueFilter => {
        if (queueFilter !== filter) editFilter.push(queueFilter);
      });
      if (editFilter === queue.filter) error = true;
      else newFilter = editFilter;
    }

    let msg = null;
    if (args[0] === "clear") {
      if (error) {
        msg = "❌ ┃ 音樂音效已經是空的了";
      } else {
        queue.filter = newFilter;
        msg = "✅ ┃ 成功清除音樂音效, 重新播放歌曲將會套用目前設定!";
      }
    } else if (args[0] === "add") {
      if (error) {
        msg = `❌ ┃ 無法新增音效${args[1]}，音樂音效已經開啟了!`;
      } else {
        queue.filter = newFilter;
        msg = `✅ ┃ 成功新增音效${args[1]}, 重新播放歌曲將會套用目前設定!`;
      }
    } else if (args[0] === "remove") {
      if (error) {
        msg = `❌ ┃ 無法移除音效${args[1]}，音樂音效已經被移除了!`;
      } else {
        queue.filter = newFilter;
        msg = `✅ ┃ 成功移除音樂音效${args[1]}, 重新播放歌曲將會套用目前設定!`;
      }
    }
    if(message.slash) message.slash.send(msg).catch(console.error);
    else message.channel.send(msg).catch(console.error);
  }
};