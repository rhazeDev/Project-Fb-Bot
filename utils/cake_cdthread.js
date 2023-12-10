// module.exports.run = async (api, event, args, senderID, threadID) => {
//   const input = args[0];
//   const regex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/gm;
//   const mlgc = "6902177439793584";

//   if (threadID === mlgc && !regex.test(input)) {
//     api.removeUserFromGroup(senderID, mlgc);
//   }
// }
