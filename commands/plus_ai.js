//vip user command

const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if(db.vip.includes(senderID) || db.vipThread.includes(threadID)) {
    if (!(args.length === 0)) {
      let query = args.join(" ");
      let action = "";
      let convo_data = []
      try {
        if (fs.existsSync(`src/aiconvo/${senderID}.json`)) {
          try {
            let convo_data = fs.readFileSync(`src/aiconvo/${senderID}.json`, 'utf8');
            action = "continue";
          } catch (error) {
            console.error(error);
          }
        } else {
          fs.writeFileSync(`src/aiconvo/${senderID}.json`, "[]", "utf8");
          action = "new";
        }
        
        // create a prompt
        if (action == "new") {
          convo_data = [{role: "system", content: "You are helpful assistant."}, {role: "user", content: query }];
        } else if (action == "continue") {
          convo_data.push({ role: "user", content: query });
        }
        
        if (event.type === "message") {
          //start new conversation

          //reset convo_data
          let convo_data = []

          convo_data.push({"role": "system", "content": "You are helpful assistant."}, {"role": "user", "content": query})
          
          const configuration = new Configuration({
            apiKey: db.openaikey,
          });
          const openai = new OpenAIApi(configuration);
          const {data} = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: convo_data
          });
          let response = data.choices[0].message.content;
          
          //set convo_data
          convo_data.push({"role": "assistant", "content": response});

          //send message
          api.sendMessage(response, threadID, msgID);

          //save convo_data
          fs.writeFileSync(`src/aiconvo/${senderID}.json`, JSON.stringify(convo_data));
          
        } else if (event.type === "message_reply") {
          //continue conversation
          convo_data.push({"role": "user", "content": query});

           const configuration = new Configuration({
            apiKey: db.openaikey,
          });
          const openai = new OpenAIApi(configuration);
          const {data} = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: convo_data
          });
          let response = data.choices[0].message.content;

          //set convo_data
          convo_data.push({"role": "assistant", "content": response});

          //send message
          api.sendMessage(response, threadID, msgID);

          //save convo_data
          fs.writeFileSync(`src/aiconvo/${senderID}.json`, JSON.stringify(convo_data));
          
        }
        
      } catch (error) {
        console.log(error.message);
      }
    } else {
      api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}plus_ai query`, threadID, msgID);
    }
  } else {
    api.sendMessage(`⚠️Your current plan does not includes this command.`, threadID, msgID);
  }
}