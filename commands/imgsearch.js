const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const http = require("https");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if (db.vip.includes(senderID) || db.basic.includes(senderID) || db.vipThread.includes(threadID)) {
    if (!(args.length === 0)) {
      try {
        let query = args.join(" ");
        
        const configuration = new Configuration({
          apiKey: db.openaikey,
        });
  
        const openai = new OpenAIApi(configuration);
        const response = await openai.createImage({
          prompt: query,
          n: 1,
          size: "256x256",
        });
  
        if (response.data.data && response.data.data.length > 0) {
          const dlurl = response.data.data[0].url;
          const file = fs.createWriteStream(src+"dalle.png");
  
          console.log("[DOWNLOADER]", "Starting")
          var gifRequest = http.get(dlurl, function (gifResponse) {
            gifResponse.pipe(file);
            file.on("finish", function() {
              console.log("[DOWNLOADER]", "Finished")
            
              const message = {
                body: "✅IMAGE GENERATED!\n",
                attachment: fs.createReadStream(src + 'dalle.png')
              }
    
              api.sendMessage(message, threadID, msgID);
            });
          });
          
        } else {
          api.sendMessage(`⚠️An error has occurred: no image found for query "${query}"`, threadID, msgID);
        }
        
      } catch (error) {
        api.sendMessage(`⚠️An error has occurred: ${error.message}`, threadID, msgID)
      }
    } else {
      api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}imgsearch query`, threadID, msgID);
    }
  } else {
    api.sendMessage(`⚠️Your current plan does not include this command.`, threadID, msgID);
  }
}