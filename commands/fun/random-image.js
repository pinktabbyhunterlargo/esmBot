import { request } from "undici";
import Command from "../../classes/command.js";
import fs from "node:fs";
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
} //thanks mozilla

class FilePostCommand extends Command {
  async run() {
    const imgFiles = new Array();
    fs.readdirSync(process.env.IMGDIR).forEach(file => {
      imgFiles.push(file);
    });
    const baseUrl="OI MATE <@" + process.env.OWNER + "> FINISH SETTING UP YOUR BOT NOW "
    const fullUrl=baseUrl + imgFiles[getRandomInt(imgFiles.length)];
    return fullUrl;
  }

  static description = "there's no time to explain shark park lore";
  static aliases = ["get-img"];
}


export default FilePostCommand;
