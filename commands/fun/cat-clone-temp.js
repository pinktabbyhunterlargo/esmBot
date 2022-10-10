import { request } from "undici";
import Command from "../../classes/command.js";

class FilePostCommand extends Command {
  async run() {
    const baseUrl = "http://bbfj.ddns.net/img-api/";

    return "(success) - baseUrl=" + baseUrl;
  }

  static description = "there's no time to explain shark park lore";
  static aliases = [];
}

export default FilePostCommand;
