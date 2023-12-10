const axios = require("axios");
const fs = require("fs");
const request = require("request");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if (!(args.length === 0)) {
    const url = 'https://www.tikwm.com/api/';
    const requestBody = {
      "url": args[0],
      "count": 12,
      "cursor": 0,
      "web": 1,
      "hd": 1
    };
    
    axios.post(url, requestBody)
    .then((response) => {
      const res = response.data;
      var title = res.data.title;
      var dlurl = `https://www.tikwm.com${res.data.hdplay}`;
  
      console.log("[DOWNLOADER]", "Starting")
      
      var file = fs.createWriteStream(src+"tiktok.mp4");
      var link = request(encodeURI(dlurl));
      link.pipe(file);
      file.on("close",() =>{
        console.log("[DOWNLOADER]", "Finished")
        
        var message = {
          body: title,
          attachment: fs.createReadStream(src + 'tiktok.mp4')
        }
  
        api.sendMessage(message, threadID, msgID).then(resp => {deleteAttach();})
        api.setMessageReaction("✅", msgID, (err) => {}, true);
        async function deleteAttach() {
          const filePath = src + 'tiktok.mp4';
          await fs.promises.unlink(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      });
    })
    .catch((error) => {
      api.setMessageReaction("❎", msgID, (err) => {}, true);
      api.sendMessage(`⚠️An error has occured!\n${error.message}`)
    });
  } else {
    api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}ttdl tiktok_link`, threadID, msgID);
  }
}