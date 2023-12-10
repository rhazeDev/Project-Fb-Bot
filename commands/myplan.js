module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  let plan = null;

  if (db && db.ibasic && db.ibasic.length > 0) {
    for (let i = 0; i < db.ibasic.length; i++) {
      var validity = db.ibasic[i].user.validity;
      if (db.ibasic[i].user.id === senderID) {
        plan = "Basic";
        api.sendMessage(`Your current plan is ${plan}!\nValid until: ${validity}`, threadID, msgID);
        break;
      }
    }
  }

  if (!plan && db && db.ivip && db.ivip.length > 0) {
    for (let i = 0; i < db.ivip.length; i++) {
      var validity = db.ivip[i].user.validity;
      if (db.ivip[i].user.id === senderID) {
        plan = "VIP";
        api.sendMessage(`Your current plan is ${plan}!\nValid until: ${validity}`, threadID, msgID);
        break;
      }
    }
  }

  if (!plan) {
    api.sendMessage(`Your current plan is FREE!`, threadID, msgID);
  }
}
