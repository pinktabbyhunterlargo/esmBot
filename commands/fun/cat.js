import { request } from "undici";
import Command from "../../classes/command.js";

class CatCommand extends Command {
  async run() {
    await this.acknowledge();
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);
    try {
      const data = await request("https://files.projectlounge.pw/cta/", { method: "HEAD", signal: controller.signal });
      clearTimeout(timeout);
      return `https://files.projectlounge.pw${data.headers.location}`;
    } catch (e) {
      if (e.name === "AbortError") {
        this.success = false;
        return "I couldn't get a cat image in time. Maybe try again?";
      }
    }
  }

  static description = "Gets a random cat picture";
  static aliases = ["kitters", "kitties", "kitty", "cattos", "catto", "cats", "cta"];
}

export default CatCommand;