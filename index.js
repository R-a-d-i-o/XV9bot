// index.js
require('dotenv').config({ path: './env.txt' });
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ],
});

/* CONFIG */
const WELCOME_CHANNEL_ID = "858382440241561611";
const WELCOME_GIF = './welcome.gif';
const BUST_SCENARIOS = [
  { message: "just got busted !!", gif: './busted.gif' },
  { message: "just busted !!", gif: './kingdomkam.gif' }
];
const KINGDOM_GIF = './kingdomkam.gif';

/* EXPRESS KEEP-ALIVE (for UptimeLift) */
const app = express();
app.get('/', (_, res) => res.send("OK"));
app.listen(process.env.PORT || 3000, () =>
  console.log("Keep-alive server running")
);

/* --- WELCOME EVENT --- */
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    await channel.send({
      content: `Welcome <@${member.user.id}>!!`,
      files: [WELCOME_GIF],
      allowedMentions: { users: [member.user.id] }
    });

    console.log(`✅ Sent welcome GIF to ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Failed to send welcome GIF:", err);
  }
});

/* --- COMMAND HANDLER --- */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const del = () => message.delete().catch(() => {});

  /* .ping */
  if (message.content === ".ping") {
    return message.channel.send("Pong! 🏓");
  }

  /* --- .bust COMMAND (50/50 RANDOM SCENARIOS) --- */
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
      const text = `<@${randomMember.user.id}> ${scenario.message}`;

      await message.channel.send({
        content: text,
        files: [scenario.gif],
        allowedMentions: { users: [randomMember.user.id] }
      });

      return del();
    } catch (err) {
      console.error("❌ .bust failed:", err);
      return message.channel.send("Something went wrong with .bust.");
    }
  }

  /* --- KINGDOM KAM --- */
  if (message.content === ".kingdom" || message.content === ".kam") {
    try {
      await message.channel.send({
        content: "🔥 KINGDOM KAM 🔥",
        files: [KINGDOM_GIF],
        allowedMentions: { users: [] }
      });
      return del();
    } catch (err) {
      console.error("❌ kingdom command failed:", err);
    }
  }

  /* .mem */
  if (message.content === ".mem") {
    await message.channel.send(`Total members: ${message.guild.memberCount}`);
    return del();
  }

  /* .pfp */
  if (message.content.startsWith(".pfp")) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({
      files: [user.displayAvatarURL({ size: 512, dynamic: true })]
    });
    return del();
  }

  /* HOT AUNTIES */
  if (message.content.startsWith(".hotauntiesnearme")) {
    const hotNumbers = ["03075386948","03410014849","03000540786","03117078408","03098129729"];
    const hotMessages = [
      "{number} wants some gawk gawk action 😍",
      "{number} is feeling freaky 😍",
      "{number} is feeling horny tonight 😈",
      "{number} will strangle ur cock with her bussy tonight 😈",
      "{number} is ready for a 3some 😏"
    ];
    const num = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
    const msg = hotMessages[Math.floor(Math.random() * hotMessages.length)];
    await message.channel.send(msg.replace("{number}", num));
    return del();
  }

  /* .testwelcome */
  if (message.content === ".testwelcome") {
    await message.channel.send({
      content: `Welcome <@${message.author.id}>!!`,
      files: [WELCOME_GIF],
      allowedMentions: { users: [message.author.id] }
    });
    return del();
  }
});

/* --- READY EVENT --- */
client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const KEEP_ALIVE_CHANNEL = "1440258431226478693";

  setInterval(async () => {
    try {
      const channel = client.channels.cache.get(KEEP_ALIVE_CHANNEL);
      if (!channel) return;

      await channel.send(`<@${client.user.id}> staying alive... 🤖`);
    } catch (err) {
      console.error("Keep-alive message failed:", err);
    }
  }, 2 * 60 * 1000); // every 2 minutes
});

/* LOGIN */
client.login(process.env.BOT_TOKEN);
