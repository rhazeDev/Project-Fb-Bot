const axios = require("axios");
const fs = require("fs");
const request = require("request");

module.exports.run = async (api, data, event, senderID, threadID, src) => {
  // Check if the unsent message has attachments
  const message =  JSON.parse(fs.readFileSync('src/messages.json', 'utf8'));
  let x = 0;
  try {
    const msg = message[event.messageID];
    if (msg && msg.type === "attachments") {
      // Download and send the attachments
      let attach = []
  
      //download attachments
      for (const attachment of msg.attachments) {
        const filename = `${msg.type}${x}.${attachment.type}`;
        const filepath = `${src}/unsent/${msg.type}${x}.${attachment.type}`;
        const url = attachment.url;
      
        console.log("[DOWNLOADER]", "Starting");
        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(filepath);
          writer.on("finish", resolve);
          writer.on("error", reject);
          request(encodeURI(url)).pipe(writer);
        });
      
        console.log("[DOWNLOADER]", "Finished");
        attach.push(fs.createReadStream(filepath));
        x = x + 1;
      }
  
      //send unsent attachment
      api.sendMessage({
        body: `${data[senderID]['name']} unsent this: \n`,
        attachment: attach,
        mentions: [{
          tag: data[event.senderID]['name'],
          id: event.senderID,
          fromIndex: 0,
        }],
      }, threadID);
  
    } else if (msg.type === "text") {
      // Send the text body
      await api.sendMessage({
        body: `${data[senderID]['name']} unsent this: \n\n${msg.text}`,
        mentions: [{
          tag: data[event.senderID]['name'],
          id: event.senderID,
          fromIndex: 0,
        }],
      }, threadID);
    }
  } catch (error) {
    console.log("Cannot read unsent message")
  }
}