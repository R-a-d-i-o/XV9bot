require('dotenv').config({ path: './env.txt' });
const express = require('express');
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

/* ---------------------------------------------------
   CLIENT SETUP
--------------------------------------------------- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ],
});

/* ---------------------------------------------------
   CONFIG
--------------------------------------------------- */
const WELCOME_CHANNEL_ID = "858382440241561611";
const RANDOM_CHANNEL = "858382440241561611";

const WELCOME_GIF = './welcome gif.gif';
const KINGDOM_GIF = './KINGDOM KAM.gif';

const BUST_SCENARIOS = [
  { message: "just got busted !!", gif: './captured.gif' },
  { message: "just busted !!", gif: './KINGDOM KAM.gif' }
];

const RANDOM_MESSAGES = [
  "Get a load of this guy 🥀",
  "Sybau twin 💔",
  "Get a job 🥀",
  "👉 ⏱️",
  "yea no shit 🥀"
];

/* ---------------------------------------------------
   EXPRESS KEEP-ALIVE
--------------------------------------------------- */
const app = express();
app.get('/', (_, res) => res.send("OK"));
app.listen(process.env.PORT || 3000, () => console.log("Keep-alive server running"));

/* ---------------------------------------------------
   AFK SYSTEM
--------------------------------------------------- */
const afkUsers = new Map();

/* ---------------------------------------------------
   WELCOME EVENT
--------------------------------------------------- */
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
      console.log(`⚠️ Missing: ${WELCOME_GIF}`);
    }
  } catch (err) {
    console.error("❌ Failed to send welcome GIF:", err);
  }
});

/* ---------------------------------------------------
   MESSAGE HANDLING
--------------------------------------------------- */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const del = () => message.delete().catch(() => {});

  /* -----------------------------------------------
     AFK COMMAND
  --------------------------------------------------- */
  if (message.content.startsWith(".afk")) {
    const reason = message.content.slice(4).trim();
    if (!reason) return message.reply("Please provide a reason for AFK.");

    afkUsers.set(message.author.id, reason);
    return message.reply(`You are now AFK: "${reason}" 🥀`);
  }

  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.channel.send(`${message.author.username} is back from AFK! 🥀`);
  }

  message.mentions.users.forEach(user => {
    if (afkUsers.has(user.id)) {
      message.channel.send(`<@${user.id}> ${afkUsers.get(user.id)} 🥀`);
    }
  });

  /* -----------------------------------------------
     BASIC COMMANDS
  --------------------------------------------------- */
  if (message.content === ".ping") {
    return message.channel.send("Pong! 🏓");
  }

  if (message.content === ".mem") {
    await message.channel.send(`Total members: ${message.guild.memberCount}`);
    return del();
  }

  if (message.content.startsWith(".pfp")) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({ files: [user.displayAvatarURL({ size: 512, dynamic: true })] });
    return del();
  }

  /* -----------------------------------------------
     TEST RANDOM MESSAGE COMMAND
     Sends random message in RANDOM_CHANNEL
  --------------------------------------------------- */
  if (message.content === ".testrandom") {
    try {
      const channel = client.channels.cache.get(RANDOM_CHANNEL);
      if (!channel) return message.reply("Random channel not found.");

      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      await channel.send(msg);
      console.log(`🧪 Test random sent in RANDOM_CHANNEL: ${msg}`);
    } catch (err) {
      console.error("❌ Test random failed:", err);
      message.reply("Test failed.");
    }
    return;
  }

  /* -----------------------------------------------
     .bust COMMAND
  --------------------------------------------------- */
  if (message.content === ".bust") {
    try {
      const onlineMembers = message.guild.members.cache.filter(m => {
        const s = m.presence?.status;
        return (["online", "idle", "dnd"].includes(s) && !m.user.bot);
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
        console.log(`⚠️ Missing GIF: ${scenario.gif}`);
      }

      return del();
    } catch (err) {
      console.error("❌ .bust error:", err);
      return message.channel.send("Something went wrong.");
    }
  }

  /* -----------------------------------------------
     KINGDOM COMMAND
  --------------------------------------------------- */
  if ([".kingdom", ".kam"].includes(message.content)) {
    if (fs.existsSync(KINGDOM_GIF)) {
      await message.channel.send({
        content: "🔥 KINGDOM KAM 🔥",
        files: [KINGDOM_GIF]
      });
    } else {
      await message.channel.send("🔥 KINGDOM KAM 🔥 (GIF missing)");
    }
    return del();
  }

  /* -----------------------------------------------
     FUNNY HOT AUNTIES COMMAND
  --------------------------------------------------- */
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

  /* -----------------------------------------------
     TEST WELCOME
  --------------------------------------------------- */
  if (message.content === ".testwelcome") {
    if (fs.existsSync(WELCOME_GIF)) {
      await message.channel.send({
        content: `Welcome <@${message.author.id}>!!`,
        files: [WELCOME_GIF],
        allowedMentions: { users: [message.author.id] }
      });
    } else {
      await message.channel.send(`Welcome <@${message.author.id}>!! (GIF missing)`);
    }
    return del();
  }
});

/* ---------------------------------------------------
   READY EVENT + AUTO RANDOM MESSAGES
--------------------------------------------------- */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Auto random message every 3 hours
  setInterval(async () => {
    try {
      const channel = client.channels.cache.get(RANDOM_CHANNEL);
      if (!channel) return;
      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      await channel.send(msg);
      console.log(`🕒 Auto random message: ${msg}`);
    } catch (err) {
      console.error("Random message error:", err);
    }
  }, 3 * 60 * 60 * 1000); // 3 hours
});

/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.BOT_TOKEN);
