const axios = require('axios');
const fs = require('fs');
const { Innertube, UniversalCache } = require('youtubei.js');

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  let query = args.join(" ");
  if (query.length === 0) {
    api.sendMessage(`⚠️Invalid use of command!\n💡${prefix}playmp3 song_title`, threadID, msgID);
    return;
  }

  try {
    const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });
    const search = await yt.music.search(query, { type: 'video' });
  
    if (search.results[0] === undefined) {
      api.sendMessage(`⚠️${query} not found!`, threadID, msgID);
    } else {
      api.sendMessage(`🔍Searching: ${query}`, threadID, msgID);
    }
    const info = await yt.getBasicInfo(search.results[0].id);
    const url = info.streaming_data?.formats[0].decipher(yt.session.player);
    const stream = await yt.download(search.results[0].id, {
      type: 'audio',
      quality: 'best',
      format: 'mp4'
    });

    const file = fs.createWriteStream(`${src}music.mp3`);

    async function writeToStream(stream) {
      const startTime = Date.now();
      let bytesDownloaded = 0;
  
      for await (const chunk of stream) {
        await new Promise((resolve, reject) => {
          file.write(chunk, (error) => {
            if (error) {
              reject(error);
            } else {
              bytesDownloaded += chunk.length;
              resolve();
            }
          });
        });
      }
  
      const endTime = Date.now();
      const downloadTimeInSeconds = (endTime - startTime) / 1000;
      const downloadSpeedInMbps = (bytesDownloaded / downloadTimeInSeconds) / (1024 * 1024);
  
      return new Promise((resolve, reject) => {
        file.end((error) => {
          if (error) {
            reject(error);
          } else {
            resolve({ downloadTimeInSeconds, downloadSpeedInMbps });
          }
        });
      });
    }
    
    async function main() {
      const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
      const fileSizeInMB = file.bytesWritten / (1024 * 1024);
  
      const messageBody = `𝕯𝖔𝖜𝖓𝖑𝖔𝖆𝖉 𝕮𝖔𝖒𝖕𝖑𝖊𝖙𝖊𝖉!\n\n𝐓𝐢𝐭𝐥𝐞: ${info.basic_info['title']}\n\n𝐒𝐢𝐳𝐞: ${fileSizeInMB.toFixed(2)}MB\n𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐒𝐩𝐞𝐞𝐝: ${downloadSpeedInMbps.toFixed(2)}Mbps\n𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐝𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${downloadTimeInSeconds.toFixed(2)} seconds`;
  
      api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(`${src}music.mp3`)
      }, threadID, msgID).then(resp => {deleteAttach();})
    }
    
    async function deleteAttach() {
      const filePath = src + 'music.mp3';
      await fs.promises.unlink(filePath);
      console.log(`Deleted: ${filePath}`);
    }
    
    main();
    
  } catch (error) {
    console.log(error.message)
    api.sendMessage(`⚠️An error has occured!\n${error.message}`)
  }
}