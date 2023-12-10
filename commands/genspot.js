const axios = require("axios")

module.exports.run = async (args, api, db, event, input, msgID, senderID, threadID, src, prefix) => {
  if(db.vip.includes(senderID)) {
    //generate alphanumeric text
    const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
    let text = '';
    let pass = '';
  
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      text += chars.charAt(randomIndex);
    }
  
    for (let i = 0; i < 8; i++) {
      const randomIndexx = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(randomIndexx);
    }
    
    const url = `https://spogentify.vercel.app/api/v1?name=NeoNode&email=${text}@node.neo&password=${pass}`;
  
    axios.get(url)
    .then((response) => {
      const res = response.data;
      if (res.message === 'Spotify account created successfully') {
        api.sendMessage(`Spotify Account Created\n\nEmail: ${text}@node.neo\nPassword: ${pass}`, threadID, msgID);
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
  }
}