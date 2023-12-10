const axios = require("axios")

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  const url = 'https://zenquotes.io/api/random?option1=value&option2=value';

  axios.get(url)
  .then((response) => {
    const res = response.data;
    var quote = res[0].q;
    var author = res[0].a;

    api.sendMessage(`${quote}\n\n-${author}`, threadID, msgID);
  })
  .catch((error) => {
    console.log(error.message);
  });
}