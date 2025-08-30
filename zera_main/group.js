const { GroupRepo } = require("../database");

module.exports = {
  name: "group",
  run: async (msg, sock) => {
    let group = await GroupRepo.getGroup(msg.chat);
    if (!group) {
      await GroupRepo.addGroup(msg.chat, "New Group");
      group = await GroupRepo.getGroup(msg.chat);
    }

    await sock.sendMessage(msg.chat, { text: `📌 Group registered!\nID: ${group.groupId}` });
  }
};
