//<=======IMPORTANT START=======>
//<=====DEPENDENCIES START=====>
const fs = require("fs");
const login = require("fca-unofficial");
const axios = require("axios");
const express = require("express");
const app = express();
const port = 3000;
const {keepalive} = require("./keep-alive.js")
const db = JSON.parse(fs.readFileSync('database.json', 'utf8'));

let msgs = {}
let cd = {}
let src = "/home/runner/Project-Fb-Bot/src/";
let msgdb = JSON.parse(fs.readFileSync(src+'/messages.json', 'utf8'))

// Define commands as a new Map
const commands = new Map();
for (file of fs.readdirSync("./commands")) {
  const commandName = file.split(".")[0];
  const command = require(`./commands/${commandName}`);
  commands.set(commandName, command);
}

const utils = new Map();
for (file of fs.readdirSync("./utils")) {
  const utilsName = file.split(".")[0];
  const util = require(`./utils/${utilsName}`);
  utils.set(utilsName, util);
}
//<=====DEPENDENCIES END=======>
//<=======IMPORTANT END========>

//<=======EVENT START========>
//<===LOGIN START===>//
login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
  if (err) return console.error(err);
  send = api.sendMessage;
  api.setOptions({ listenEvents: true });

  

  // Fix the event listener to use the correct command
  api.listen(async (err, event) => {
    try {
      let approved = db.approvedThread;
      if (approved.includes(event.threadID)) {
        if (event.type === "message" || event.type === "message_reply") {
          if (err) return console.error(err);
          let senderID = event.senderID;
          let threadID = event.threadID;
          let msgID = event.messageID;
          let prefix = db.prefix;
          let src = "/home/runner/Project-Fb-Bot/src/";
          let msgid = event.messageID;
          let input = event.body;
    
          //add command for checking
          const args = input.slice(prefix.length).trim().split(/ +/g);
          const commandName = args.shift()
          const command = commands.get(commandName);
    
          const validCommand = fs.readdirSync("./commands");
    
          try {
          //save message ids
          if (event.attachments && event.attachments.length > 0) {
            let attachmentUrls = [];
            for (const attachment of event.attachments) {
              switch (attachment.type) {
                case "photo":
                  attachmentUrls.push({ type: "jpg", url: attachment.url });
                  break;
                case "video":
                  attachmentUrls.push({ type: "mp4", url: attachment.url });
                  break;
                case "audio":
                  attachmentUrls.push({ type: "mp3", url: attachment.url });
                  break;
                case "animated_image":
                  attachmentUrls.push({ type: "gif", url: attachment.url });
                  break;
                case "sticker":
                  attachmentUrls.push({ type: "png", url: attachment.url });
                  break;
                case "file":
                  attachmentUrls.push({ type: attachment.filename.split('.').pop(), url: attachment.url });
                  break;
                case "share":
                  msgs[event.messageID] = { type: "text", text: event.body };
                  break;
                default:
                  console.log("Unknown attachment type:", attachment.type);
                  break;
              }
            }
            if (attachmentUrls.length > 0) {
              msgs[event.messageID] = { type: "attachments", attachments: attachmentUrls };
            }
          } else {
            msgs[msgID] = { type: "text", text: event.body };
          }
    
            // Add msgs to msgdb
            msgdb[event.messageID] = msgs[event.messageID]
      
            // Save msgs object to messages.json file
            fs.writeFileSync(src + "messages.json", JSON.stringify(msgdb), "utf8");
            
            // Run command
            if (validCommand.includes(commandName + ".js") && input.startsWith(prefix)) {
              
              // Check if the command is on cooldown for non-vip users
              if (!(db.vip.includes(senderID))) {
                if (db.basic.includes(senderID)) {
                  if (!(senderID in cd)) {
                   cd[senderID] = Math.floor(Date.now() / 1000) + (60 * 0.5);
                  } else if (Math.floor(Date.now() / 1000) < cd[senderID]) {
                    api.sendMessage("⚠️Opps you're going to fast! Wait for " + Math.floor(cd[senderID] - Math.floor(Date.now() / 1000)) % 60 + " second/s", threadID, msgID);
                    return 0;
                  } else {
                    cd[senderID] = Math.floor(Date.now() / 1000) + (60 * 0.5);
                  }
                } else {
                  //free user
                  if (!(senderID in cd)) {
                   cd[senderID] = Math.floor(Date.now() / 1000) + 120;
                  } else if (Math.floor(Date.now() / 1000) < cd[senderID]) {
                    api.sendMessage("⚠️Opps you're going to fast! Wait for " + Math.floor((cd[senderID] - Math.floor(Date.now() / 1000)) / 60) + " minute/s and " + Math.floor(cd[senderID] - Math.floor(Date.now() / 1000)) % 60 + " second/s", threadID, msgID);
                    return 0;
                  } else {
                    cd[senderID] = Math.floor(Date.now() / 1000) + 120;
                  }
                }
              }
            }
    
          } catch (error) {
            console.log(error.message);
          }
        } else if (event.type === "message_unsend") {
          const unsendCommand = commands.get("unsend");
          try {
            let senderID = event.senderID;
            let threadID = event.threadID;
            let src = "/home/runner/Project-Fb-Bot/src/";
            let vip = db.vip;
            if (!(vip.includes(senderID))) {
              api.getUserInfo(event.senderID, async (err, data) => {
                await unsendCommand.run(api, data, event, senderID, threadID, src);
              });
              
            }
          } catch (error) {
            console.log(error.message);
          }
        }
      }
    } catch (error) {
      console.error(error.message);
    }
    
  });
});
//<=======EVENT END==========>
app.get('/', (req, res) => {
  res.send('BOT ONLINE') 
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
