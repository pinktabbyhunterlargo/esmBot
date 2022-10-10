import { request } from "undici";
import Command from "../../classes/command.js";

class FilePostCommand extends Command {
  async run() {
    return "test";
  }

  static description = "there's no time to explain shark park lore";
  static aliases = [];
}

export default FilePostCommand;
