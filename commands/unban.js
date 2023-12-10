const fs = require("fs");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if (db.vip.includes(senderID)) {
    const bangc = JSON.parse(fs.readFileSync('src/bangc.json', 'utf8'));
    if (bangc.includes(threadID)) {
      const index = bangc.indexOf(threadID);
      bangc.splice(index, 1);
      fs.writeFileSync('src/bangc.json', JSON.stringify(bangc), "utf8");
      api.setMessageReaction("✅", msgID, (err) => {}, true);
    } else {
      api.setMessageReaction("❎", msgID, (err) => {}, true);
    }
  }
}
