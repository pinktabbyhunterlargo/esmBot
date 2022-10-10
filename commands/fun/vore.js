import Command from "../../classes/command.js";

//why did i do this again?
class VoreCommand extends Command {
  async run() {
    return "You vored " + this.options.text;
  }

  static description = "THERE'S NO TIME";
  static arguments = ["[text]"];

  static requiresImage = false;
  static requiresText = true;
  static noText = "You didn't vore";
}

export default VoreCommand;
