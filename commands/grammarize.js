//vip and basic command
const { Configuration, OpenAIApi } = require("openai");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if(db.vip.includes(senderID) || db.basic.includes(senderID) || db.vipThread.includes(threadID)) {
    if (!(args.length === 0)) {
      try {
        let query = args.join(" ");
        const configuration = new Configuration({
          apiKey: db.openaikey,
        });
  
        const openai = new OpenAIApi(configuration);
        const {data} = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `Correct this to standard English:\n\n${query}`,
          temperature: 0.0,
          max_tokens: 1500,
          top_p: 1,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        });
  
        api.sendMessage(data.choices[0].text, threadID, msgID);
      } catch (error) {
        api.sendMessage(`⚠️An error has occured!\n${error.message}`)
      }
    } else {
      api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}ai query`, threadID, msgID);
    }
  } else {
    api.sendMessage(`⚠️Your current plan does not includes this command.`, threadID, msgID);
  }
}