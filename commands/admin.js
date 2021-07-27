const fs = require("fs");

module.exports = {
  name: "admin",
  description: "Admin control for bot owner",
  register: false,
  async execute(message, args) {
    if (message.author.id !== "669194742218752070") return message.channel.send("You don't have permission to execute this command.");
    let channel;
    switch (args[0]) {
      case "join":
        channel = await message.client.channels.fetch(args[1]).catch(console.error);
        if (!channel || channel.type !== "voice") {
          message.channel.send("Provided channel is not a voice channel.");
          break;
        }
        try {
          await channel.join();
          message.channel.send("Joined provided channel.");
        } catch (e) {
          console.log(e);
          message.channel.send("Cannot join provided channel.");
        }
        break;
      case "leave":
        channel = await message.client.channels.fetch(args[1]).catch(console.error);
        if (!channel || channel.type !== "voice") {
          message.channel.send("Provided channel is not a voice channel.");
          break;
        }
        try {
          await channel.leave();
          message.channel.send("Leaved provided channel.");
        } catch (e) {
          console.log(e);
          message.channel.send("Cannot leave provided channel.");
        }
        break;
      case "shutdown":
        await message.channel.send("Shutting down...");
        process.exit(0);
        break;
      case "say":
        args.shift();
        message.channel.send(args.join(" ")).catch(console.error);
        message.delete().catch(console.error);
        break;
      case "button":
        let btn = new message.client.disbut.MessageButton()
          .setLabel("點我! (つ≧▽≦)つ")
          .setStyle("blurple")
          .setID("relax");
        message.channel.send("嘿!", btn);
        break;
    }
    return;
  }
};