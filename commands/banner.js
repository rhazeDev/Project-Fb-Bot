const fs = require("fs");
const request = require("request");
const thiccysapi = require("textmaker-thiccy");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if (!(args.length === 0)) {
    let query = args.join(" ");
    let theme = "https://textpro.me/matrix-style-text-effect-online-884.html";
    try {
      const dllink = await thiccysapi.textpro(theme, [query]);

      var file = fs.createWriteStream(src+"banner.jpg");
      var link = request(encodeURI(dllink));
      link.pipe(file);
      file.on("close",() =>{
        console.log("[DOWNLOADER]", "Finished")
        
        var message = {
          body: "Here's your banner!",
          attachment: fs.createReadStream(src + 'banner.jpg')
        }
  
        api.sendMessage(message, threadID, msgID);
        api.setMessageReaction("✅", msgID, (err) => {}, true);
        fs.promises.unlink(src+"banner.jpg");
      });
    } catch (error) {
      api.setMessageReaction("❎", msgID, (err) => {}, true);
      api.sendMessage(`⚠️An error has occured!\n${error.message}`)
    }
  } else {
    api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}banner query`, threadID, msgID);
  }
}