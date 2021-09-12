const https = require("https");
const chalk = require("chalk");
const fs = require("fs");

let platform = process.platform;
let arch = process.arch;

console.log(chalk.green("Determining system type..."));
console.log("\n");

if (platform === "aix" || platform === "sunos") {
  console.log(chalk.red.bold("Unsupported system type"));
  process.exit(1);
}

if (platform === "android") {
  console.log(chalk.orange.bold("Selecting system type 'linux' instead 'android'"));
  platform = "linux";
  console.log("\n");
}

let writeStream = fs.createWriteStream("./ffmpeg");
https.get(`https://github.com/eugeneware/ffmpeg-static/releases/download/b4.4/${platform}-${arch}`, (res) => {
  res.pipe(writeStream);
  writeStream.on("finish", () => {
    writeStream.close(() => {
      console.log(chalk.bold("Downloaded ffmpeg 4.4 static build"));
    });
  });
}).on("error", (err) => {
  console.log(chalk.red.bold("Something went wrong"));
  throw err;
});