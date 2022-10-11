import { request } from "undici";
import Command from "../../classes/command.js";

class FilePostCommand extends Command {
  async run() {
    const hostname = exec("hostname");
    if ( hostname == "rocinante" | hostname == "bbfj-pi")
      return "(success)"
  }
  else {
     //return "hey sysadmin edit this command and make sure it works right, im lazy " + __filename;
    return "(success*: wrong hostname)";
  }

  static description = "there's no time to explain shark park lore";
  static aliases = ["get-img"];
}

export default FilePostCommand;
