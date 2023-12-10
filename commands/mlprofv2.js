const fs = require('fs');
const axios = require('axios');
const async = require('async');
const request = require('request');

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  try {
    let mlprofS = fs.readFileSync(src + '/mlprofstatus.txt', 'utf8');
    if (args.length > 1) {
      if (mlprofS === "ok") {
        const startTime = Date.now();
        function validateImageUrl(url, callback) {
          axios
            .get(url, { responseType: 'stream' })
            .then((response) => {
              const isValid =  response.headers['content-type'].startsWith('image/');
              callback(null, { url, isValid });
            })
            .catch((error) => {
              callback(null, { url, isValid: false });
            });
        }
        fs.writeFileSync(src + '/mlprofstatus.txt', "ops");
        api.sendMessage("Command processing, please wait for less than 5 minutes!", threadID, msgID);
        let mlid = args[0];
        let mlserver = args[1];
        let last1 = mlid.slice(-2);
        let last2 = mlid.slice(-4, -2);
        axios.get(`https://busyatmedical.000webhostapp.com/rankinfo.php?role=${mlid}&key=Muskan&zone=${mlserver}&srange=1&erange=2`)
          .then(response => {
            if (response.data.Information.Response === 'Success') {
              const resp = response.data;
              let ign = resp.Information.Ign;
              let rank = resp.Information.RankPosition;
              let stars = resp.Information.Stars;
              let stage = resp.Information.RankStage;
              let imageUrls = [];
              let attach = [];
              console.log("[CONSOLE]", "Generating avatars");
              for (let i = 0; i < 100; i++) {
                let url = `https://wsavatar.yuanzhanapp.com/dist/photo/${mlserver}/${last1}/${last2}/${mlid}_${i}_hd.jpg`;
                imageUrls.push(url);
                let url2 = `https://akmpicture.youngjoygame.com/dist/face/${mlserver}/${last1}/${last2}/${mlid}_${i}.jpg`
                imageUrls.push(url2);
              }
              console.log("[CONSOLE]", "Validating image");
              async.mapSeries(imageUrls, validateImageUrl, async (err, results) => {
                if (err) {
                  console.error('Error:', err);
                  return;
                }

                const validUrls = results.filter(({ isValid }) => isValid).map(({ url }) => url);

                let x = 0;
                let total_attach_size = 0
                let d_attach = []
                console.log("[DOWNLOADER]", "Starting");
                for await (const avatarUrl of validUrls) {
                  const fileName = `avatar${x}.jpg`;
                  const filePath = `${src}/avatars/${fileName}`;
                  const avt_url = validUrls[x];
                  
                  await new Promise((resolve, reject) => {
                    const writer = fs.createWriteStream(filePath);
                    writer.on("finish", resolve);
                    writer.on("error", reject);
                    request(encodeURI(avt_url)).pipe(writer);
                  });
                  
                  const stats = fs.statSync(filePath);
                  const fileSizeInBytes = stats.size;
                  const a_filesize = fileSizeInBytes / (1024*1024);
                    
                  total_attach_size = total_attach_size + a_filesize;
                  if (x < 50) {
                    attach.push(fs.createReadStream(filePath));
                  }
                  d_attach.push(fs.createReadStream(filePath));
                  console.log("[DOWNLOADER]", "Finished");
                  x = x + 1;
                }

                const requestBody = {
                  "uid": mlid
                }

                axios.post("https://tools.rhazeee.repl.co/api/mlwinrate", requestBody)
                  .then(response => {
                    const wdata = response.data;
                    let winratedata = "";
                    for (let i = 0; i < 5; i++) {
                      const hero = wdata[i].hero;
                      const wins = wdata[i].wins;
                      const match = wdata[i].matches;
                      const hwinrate = wdata[i].winrate;
                      const hclm = wdata[i].classicMatches;
                      const hclw = wdata[i].classicWins;
                      const hrgm = wdata[i].rankedMatches;
                      const hrgw = wdata[i].rankedWins;
                      let hcls = (hclw / hclm) * 100;
                      let hrgs = (hrgw / hrgm) * 100;
                      let htcl = hcls.toFixed(2);
                      if (isNaN(htcl)) {
                        htcl = "0.00";
                      }
                      let htrg = hrgs.toFixed(2);
                      if (isNaN(htrg)) {
                        htrg = "0.00";
                      }
                      winratedata = winratedata + `🦸‍♀️𝗛𝗲𝗿𝗼: ${hero}\n𝗧𝗼𝘁𝗮𝗹\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${match}\n𝐖𝐢𝐧𝐬: ${wins}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${hwinrate}%\n\n𝗥𝗮𝗻𝗸𝗲𝗱\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${hrgm}\n𝐖𝐢𝐧𝐬: ${hrgw}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${htrg}%\n\n𝗖𝗹𝗮𝘀𝘀𝗶𝗰\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${hclm}\n𝐖𝐢𝐧𝐬: ${hclw}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${htcl}%\n\n`
                    }
                    totalm = 0
                    totalw = 0
                    rg_total_win = 0
                    rg_total_match = 0
                    cl_total_win = 0
                    cl_total_match = 0

                    for (let i = 0; i < wdata.length; i++) {
                      let w = wdata[i].wins;
                      let m = wdata[i].matches;
                      totalm = totalm + m;
                      totalw = totalw + w;
                      rg_total_match = rg_total_match + wdata[i].rankedMatches;
                      rg_total_win = rg_total_win + wdata[i].rankedWins;
                      cl_total_match = cl_total_match + wdata[i].classicMatches;
                      cl_total_win = cl_total_win + wdata[i].classicWins;

                    }

                    let twinrate = (totalw / totalm) * 100;
                    let tclwinrate = (cl_total_win / cl_total_match) * 100;
                    let trgwinrate = (rg_total_win / rg_total_match) * 100;
                    let totalrankedwinrate = trgwinrate.toFixed(2);
                    let totalclassicwinrate = tclwinrate.toFixed(2);
                    let totalwinrate = twinrate.toFixed(2);
                    
                    api.sendMessage({
                      body: `𝕸𝕷𝕭𝕭 𝕻𝖗𝖔𝖋𝖎𝖑𝖊\n📛𝐈𝐠𝐧: ${ign}\n🏆𝐑𝐚𝐧𝐤: ${rank} ${stage} ⭐${stars}\n\n\n📊𝗠𝗮𝘁𝗰𝗵𝗲𝘀 𝗦𝘁𝗮𝘁𝘀\n𝗧𝗼𝘁𝗮𝗹\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${totalm}\n𝐖𝐢𝐧𝐬: ${totalw}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${totalwinrate}%\n\n𝗥𝗮𝗻𝗸𝗲𝗱\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${rg_total_match}\n𝐖𝐢𝐧𝐬: ${rg_total_win}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${totalrankedwinrate}%\n\n𝗖𝗹𝗮𝘀𝘀𝗶𝗰\n𝐌𝐚𝐭𝐜𝐡𝐞𝐬: ${cl_total_match}\n𝐖𝐢𝐧𝐬: ${cl_total_win}\n𝐖𝐢𝐧𝐫𝐚𝐭𝐞: ${totalclassicwinrate}%\n\n\n💂‍♀️𝟱 𝗠𝗼𝘀𝘁 𝗨𝘀𝗲𝗱 𝗛𝗲𝗿𝗼𝗲𝘀\n${winratedata}🖼️𝗔𝘃𝗮𝘁𝗮𝗿𝘀 & 𝗔𝗹𝗯𝘂𝗺𝘀`,
                      attachment: attach,
                    }, threadID, msgID).then(resp => {deleteavatar();})

                    async function deleteavatar() {
                      console.log("[CONSOLE]", "Deleting avatars!");
                      let ac = 0;
                      for (const filePath of d_attach.map((fileStream) => fileStream.path)) {
                        try {
                          await fs.promises.unlink(filePath);
                          
                          ac++;
                        } catch (error) {
                          console.error("Error deleting file:", error);
                        }
                      }
                      console.log("[CONSOLE]", "Avatars deleted!");
                      console.log("total avatar: " + ac)
                      console.log("Total attachment size: ", total_attach_size);
                    }
                    fs.writeFileSync(src + '/mlprofstatus.txt', "ok");
                    const endTime = Date.now();
      const processTime = (endTime - startTime) / 1000;
                    console.log('Process time:', processTime);
                  })
                  .catch((error) => {
                    console.error("getwinrate: " + error.message);
                    api.sendMessage(`⚠️An error has occured!\n💡${error.message}`, threadID, msgID)
                    fs.writeFileSync(src + '/mlprofstatus.txt', "ok");
                  });
              });
            } else {
              api.sendMessage(`⚠️Error code: ${response.data.code}\n💡Error message: ${response.data.msg}`, threadID, msgID);
              fs.writeFileSync(src + '/mlprofstatus.txt', "ok");
            }
          })
          .catch((error) => {
            console.error("getdatas: " + error.message);
            api.sendMessage(`⚠️An error has occured!\n💡Id or Server is Invalid`, threadID, msgID)
            fs.writeFileSync(src + '/mlprofstatus.txt', "ok");
          });


      } else {
        api.sendMessage("⚠️Command still in process!\n💡Wait for your turn", threadID, msgID);
      }
    } else {
      api.sendMessage(`⚠️Invalid use of command!\n💡${prefix}mlprofv2 id server`, threadID, msgID);
    }


  } catch (err) {
    console.log(err.message);
    api.sendMessage(`⚠️An error has occured!\n💡${err.message}`, threadID, msgID);
  }
};
