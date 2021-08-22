module.exports = {
  name: "filter",
  description: "變更音樂等化器",
  register: true,
  execute(message, args) {
    const queue = message.client.players.get(message.guild.id);
    const filters = {
      "bassboost": "bass=g=7",
      "8D": "apulsator=hz=0.09",
      "nightcore": "aresample=48000,asetrate=48000*1.15",
      "vaporwave": "aresample=48000,asetrate=48000*0.8",
      "surrounding": "surround",
      "treble": "treble=g=5",
      "subboost": "asubboost"
    };
    if (!queue) {
      message.reply("❌ ┃ 目前沒有任何歌曲正在播放!")
        .catch(console.error);
    }
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
    message.reply(msg)
      .catch(console.error);
  }
};