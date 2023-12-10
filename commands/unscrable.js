const axios = require('axios');

module.exports.run = async (args, api, event, input, db, msgID, senderID, threadID, src, prefix) => {
  try {
    if (!(args.length === 0)) {
  
      axios.get('https://fly.wordfinderapi.com/api/search', {
        params: {
          letters: args[0].toLowerCase(),
          word_sorting: 'points',
          group_by_length: true,
          page_size: 20,
          dictionary: 'wwf2'
        }
      })
      .then(function (response) {
        var parsedData = response.data;
        var allWords = "";
        
        for (var i = 0; i < parsedData.word_pages.length; i++) {
          var wordPage = parsedData.word_pages[i];
          for (var j = 0; j < wordPage.word_list.length; j++) {
            wordCount = wordPage.word_list[j].word.length
            allWords += "\n["+wordCount+"]> " + wordPage.word_list[j].word;
          }
        }
        api.sendMessage(`Words from "${args[0]}"\n${allWords}`, threadID, msgID);
      })
      .catch(function (error) {
        api.sendMessage(`⚠️An error has occured!\n${error.message}`)
      });
    } else {
      api.sendMessage(`⚠️Invalid Use Of Command!\n💡Usage: ${prefix}unscrable word`, threadID, msgID);
    }
  } catch (error) {
    console.error(error.message);
  }
};