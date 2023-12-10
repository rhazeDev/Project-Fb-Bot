const axios = require('axios');

module.exports.run = async (api, event, args, senderID, threadID, cooldown, commandName) => {
  let query = args.join(" ");
  api.getThreadInfo(threadID, (err, info) => {
    let threadName = info.threadName;
    api.getUserInfo(event.senderID, async (err, data) => {
      const currentDate = new Date();
      const options = { timeZone: 'Asia/Manila' };
      const manilaTime = currentDate.toLocaleString('en-US', options);
      var name = data[event.senderID]['name'];
      const webhookUrl = 'https://discord.com/api/webhooks/1079353783953391646/qldtMexJUGZSJ64PXjAZ7mmFYXLi7QvzMhCTyOWsJaEYsTxiW91eWJSAWOeSP7sdEsl-';
  
      axios.post(webhookUrl, {
        content: `Time: ${manilaTime}\nSender Name: ${name}\nSender Id: ${senderID}\nThread Name: ${threadName}\nThread Id: ${threadID}\nCommand Name: ${commandName}\nQuery: ${query}\n<=========================>`
      })
      .then(response => {
        console.log('[MONITOR]','Sent');
      })
      .catch(error => {
        console.log('Error sending message: ', error.message);
      });
    });
  });
}