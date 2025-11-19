const fs = require('fs');

/* CONFIG */
const WELCOME_CHANNEL_ID = "858382440241561611";
const WELCOME_GIF = './welcome gif.gif';
const BUST_SCENARIOS = [
  { message: "just got busted !!", gif: './captured.gif' },
  { message: "just busted !!", gif: './KINGDOM KAM.gif' }
];
const KINGDOM_GIF = './KINGDOM KAM.gif';

/* --- WELCOME EVENT --- */
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    if (fs.existsSync(WELCOME_GIF)) {
      await channel.send({
        content: `Welcome <@${member.user.id}>!!`,
        files: [WELCOME_GIF],
        allowedMentions: { users: [member.user.id] }
      });
      console.log(`✅ Sent welcome GIF to ${member.user.tag}`);
    } else {
      console.log(`⚠️ ${WELCOME_GIF} not found, skipping welcome GIF`);
    }
  } catch (err) {
    console.error("❌ Failed to send welcome GIF:", err);
  }
});

/* --- .bust COMMAND --- */
if (message.content === ".bust") {
  try {
    const onlineMembers = message.guild.members.cache.filter(m => {
      const s = m.presence?.status;
      return (
        (s === "online" || s === "idle" || s === "dnd") &&
        !m.user.bot
      );
    });

    if (onlineMembers.size === 0) {
      await message.reply("Nobody online to bust 😭");
      return del();
    }

    const randomMember = onlineMembers.random();
    const scenario = BUST_SCENARIOS[Math.floor(Math.random() * BUST_SCENARIOS.length)];

    if (fs.existsSync(scenario.gif)) {
      await message.channel.send({
        content: `<@${randomMember.user.id}> ${scenario.message}`,
        files: [scenario.gif],
        allowedMentions: { users: [randomMember.user.id] }
      });
    } else {
      await message.channel.send(`<@${randomMember.user.id}> ${scenario.message}`);
      console.log(`⚠️ ${scenario.gif} not found, sent message without GIF`);
    }

    return del();
  } catch (err) {
    console.error("❌ .bust failed:", err);
    return message.channel.send("Something went wrong with .bust.");
  }
}

/* --- KINGDOM COMMAND --- */
if (message.content === ".kingdom" || message.content === ".kam") {
  try {
    if (fs.existsSync(KINGDOM_GIF)) {
      await message.channel.send({
        content: "🔥 KINGDOM KAM 🔥",
        files: [KINGDOM_GIF],
        allowedMentions: { users: [] }
      });
    } else {
      await message.channel.send("🔥 KINGDOM KAM 🔥 (GIF missing)");
      console.log(`⚠️ ${KINGDOM_GIF} not found, sent message without GIF`);
    }
    return del();
  } catch (err) {
    console.error("❌ kingdom command failed:", err);
  }
}
