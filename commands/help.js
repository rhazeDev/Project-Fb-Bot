module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  const commands = db.commands;
  const response = [];

  commands.forEach((command) => {
    const name = command.name;
    const description = command.description;
    const plan = command.plan;
    let planIndicator = '';

    if (plan === 'vip') {
      planIndicator = '🔴';
    } else if (plan === 'basic') {
      planIndicator = '🟠';
    } else if (plan === 'free') {
      planIndicator = '🟢';
    }
    
    response.push(`${planIndicator}/${name}\n📜=>${description}`);
  });

  api.sendMessage({
    body: "List of Commmands\n\n🔴: Vip command\n🟠: Vip/Basic command\n🟢: Free command\n\n" + response.join('\n\n')
  }, threadID, msgID);
}
