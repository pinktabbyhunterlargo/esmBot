import { Constants } from "oceanic.js";
import database from "../../utils/database.js";
import * as collections from "../../utils/collections.js";
import { random } from "../../utils/misc.js";
import paginator from "../../utils/pagination/pagination.js";
import * as help from "../../utils/help.js";
import Command from "../../classes/command.js";
const tips = ["You can change the bot's prefix using the prefix command.", "Image commands also work with images previously posted in that channel.", "You can use the tags commands to save things for later use.", "You can visit https://esmbot.net/help.html for a web version of this command list.", "You can view a command's aliases by putting the command name after the help command (e.g. help image).", "Parameters wrapped in [] are required, while parameters wrapped in {} are optional.", "esmBot is hosted and paid for completely out-of-pocket by the main developer. If you want to support development, please consider donating! https://patreon.com/TheEssem"];

class HelpCommand extends Command {
  async run() {
    const { prefix } = this.guild ? await database.getGuild(this.guild.id) : "N/A";
    if (this.args.length !== 0 && (collections.commands.has(this.args[0].toLowerCase()) || collections.aliases.has(this.args[0].toLowerCase()))) {
      const command = collections.aliases.get(this.args[0].toLowerCase()) ?? this.args[0].toLowerCase();
      const info = collections.info.get(command);
      const counts = await database.getCounts();
      const embed = {
        embeds: [{
          author: {
            name: "esmBot Help",
            iconURL: this.client.user.avatarURL()
          },
          title: `${this.guild ? prefix : ""}${command}`,
          url: "https://esmbot.net/help.html",
          description: command === "tags" ? "The main tags command. Check the help page for more info: https://esmbot.net/help.html" : info.description,
          color: 16711680,
          fields: [{
            name: "Aliases",
            value: info.aliases.length !== 0 ? info.aliases.join(", ") : "None"
          }, {
            name: "Times Used",
            value: counts[command],
            inline: true
          }, {
            name: "Parameters",
            value: command === "tags" ? "[name]" : (info.params ? (info.params.length !== 0 ? info.params.join(" ") : "None") : "None"),
            inline: true
          }]
        }]
      };
      if (info.flags.length !== 0) {
        const flagInfo = [];
        for (const flag of info.flags) {
          if (flag.type === 1) continue;
          flagInfo.push(`\`--${flag.name}${flag.type ? `=[${Constants.ApplicationCommandOptionTypes[flag.type]}]` : ""}\` - ${flag.description}`);
        }
        if (flagInfo.length !== 0) {
          embed.embeds[0].fields.push({
            "name": "Flags",
            "value": flagInfo.join("\n")
          });
        }
      }
      return embed;
    } else {
      if (this.guild && !this.channel.permissionsOf(this.client.user.id.toString()).has("EMBED_LINKS")) {
        this.success = false;
        return "I don't have the `Embed Links` permission!";
      }
      const pages = [];
      if (help.categories === help.categoryTemplate && !help.generated) help.generateList();
      for (const category of Object.keys(help.categories)) {
        const splitPages = help.categories[category].map((item, index) => {
          return index % 15 === 0 ? help.categories[category].slice(index, index + 15) : null;
        }).filter((item) => {
          return item;
        });
        const categoryStringArray = category.split("-");
        for (const index of categoryStringArray.keys()) {
          categoryStringArray[index] = categoryStringArray[index].charAt(0).toUpperCase() + categoryStringArray[index].slice(1);
        }
        for (const page of splitPages) {
          pages.push({
            title: categoryStringArray.join(" "),
            page: page
          });
        }
      }
      const embeds = [];
      for (const [i, value] of pages.entries()) {
        embeds.push({
          embeds: [{
            author: {
              name: "esmBot Help",
              iconURL: this.client.user.avatarURL()
            },
            title: value.title,
            description: value.page.join("\n"),
            color: 16711680,
            footer: {
              text: `Page ${i + 1} of ${pages.length}`
            },
            fields: [{
              name: "Prefix",
              value: this.guild ? prefix : "N/A"
            }, {
              name: "Tip",
              value: random(tips)
            }]
          }]
        });
      }
      return paginator(this.client, { type: this.type, message: this.message, interaction: this.interaction, author: this.author }, embeds);
    }
  }

  static description = "Gets a list of commands";
  static aliases = ["commands"];
  static arguments = ["{command}"];
  static slashAllowed = false;
}

export default HelpCommand;
