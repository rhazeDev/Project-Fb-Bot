module.exports.run = async (args, api, event, input, db, msgID, senderID, threadID, src, prefix) => {
  if (args.length < 2) {
    api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}beshiefy words here`, threadID, msgID);
    return;
  }

  api.sendMessage(args.join(" 🤸‍♀️ "), threadID, msgID);
}
  