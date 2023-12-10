module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  const botname = db.botname;
  const description = db.description;
  const botdev = db.botdev;
  const botowner = db.botowner.join(", ");
  const botcredits = db.botcredits.join(", ");
  
  const message = `Bot Name: ${botname}\n\nPrefix: "${prefix}"\n\nDescription: ${description}\n\nDeveloper: ${botdev}\n\nOwner: ${botowner}\n\nCredits: ${botcredits}`;
  
  api.sendMessage(message, threadID, msgID);
}
