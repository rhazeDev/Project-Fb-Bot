module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if (db.vip.includes(senderID)) {
    api.unsendMessage(event.messageReply.messageID, (err) => {});
    api.setMessageReaction("✅", msgID, (err) => {}, true);
  } else {
    api.sendMessage(`⚠️Your current plan does not includes this command.`, threadID, msgID);
  }
}