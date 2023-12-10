module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  api.sendMessage(senderID, threadID);
};