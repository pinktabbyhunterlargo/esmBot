import { request } from "undici";
import Command from "../../classes/command.js";

class FilePostCommand extends Command {
  async run() {
    await this.acknowledge();
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);
    try {
      const data = await request("https://projectlounge.pw/cta/", { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      return data.headers.location;
    } catch (e) {
      if (e.name === "AbortError") {
        this.success = false;
        return "I couldn't get a cat image in time. Maybe try again?";
      }
    }
  }

  static description = "just a clone of cat for now";
  static aliases = ["kitters", "kitties", "kitty", "cattos", "catto", "cats", "cta"];
}

export default FilePostCommand;
