const Command = require("../../classes/command.js");

class ReloadCommand extends Command {
  // quite possibly one of the hackiest commands in the bot
  run() {
    return new Promise((resolve) => {
      if (this.message.author.id !== process.env.OWNER) resolve(`${this.message.author.mention}, only the bot owner can reload commands!`);
      if (this.args.length === 0) resolve(`${this.message.author.mention}, you need to provide a command to reload!`);
      this.ipc.broadcast("reload", { cmd: this.args[0] });
      this.ipc.register("reloadSuccess", () => {
        this.ipc.unregister("reloadSuccess");
        this.ipc.unregister("reloadFail");
        resolve(`${this.message.author.mention}, the command \`${this.args[0]}\` has been reloaded.`);
      });
      this.ipc.register("reloadFail", (message) => {
        this.ipc.unregister("reloadSuccess");
        this.ipc.unregister("reloadFail");
        resolve(message);
      });
    });
  }

  static description = "Reloads a command";
  static arguments = ["[command]"];
}

module.exports = ReloadCommand;