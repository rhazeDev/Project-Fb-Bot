const axios = require('axios');

process.stdout.write('\x1Bc');

console.log(`Node version: ${process.versions.node}`)

//make it always on

// setInterval(() => {
//   axios.get('https://project-fb-bot.rhaze-me.repl.co')
//     .then((response) => {
//       const currentDate = new Date();
//       const options = { timeZone: 'Asia/Manila' };
//       const manilaTime = currentDate.toLocaleString('en-US', options);
//       const timelang = manilaTime.split(', ')[1];

//       console.log(`[${timelang}]`, response.data);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }, 10000);