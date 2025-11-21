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
   RANDOM MESSAGE TOGGLE SYSTEM
--------------------------------------------------- */
let randomEnabled = true;
let randomInterval = null;

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
     DISABLE RANDOM MESSAGES
  --------------------------------------------------- */
  if (message.content === ".norandom") {
    randomEnabled = false;
    clearInterval(randomInterval);
    return message.channel.send("❌ Random messages disabled.");
  }

  /* -----------------------------------------------
     ENABLE RANDOM MESSAGES + INSTANT SEND + RESET TIMER
  --------------------------------------------------- */
  if (message.content === ".yesrandom") {
    randomEnabled = true;
    clearInterval(randomInterval);

    const channel = client.channels.cache.get(RANDOM_CHANNEL);
    if (channel) {
      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      channel.send(msg);
    }

    randomInterval = setInterval(async () => {
      if (!randomEnabled) return;

      try {
        const channel = client.channels.cache.get(RANDOM_CHANNEL);
        if (!channel) return;

        const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
        channel.send(msg);

      } catch (err) {
        console.error("Random message error:", err);
      }
    }, 1.5 * 60 * 60 * 1000);

    return message.channel.send("✅ Random messages enabled.");
  }

  /* -----------------------------------------------
     BASIC COMMANDS
  --------------------------------------------------- */
  if (message.content === ".ping") return message.channel.send("Pong! 🏓");

  if (message.content === ".mem") {
    await message.channel.send(`Total members: ${message.guild.memberCount}`);
    return del();
  }

  if (message.content.startsWith(".pfp")) {
    const user = message.mentions.users.first() || message.author;
    await message.channel.send({
      files: [user.displayAvatarURL({ size: 512, dynamic: true })]
    });
    return del();
  }

  /* -----------------------------------------------
     TEST RANDOM MESSAGE
  --------------------------------------------------- */
  if (message.content === ".testrandom") {
    try {
      const channel = client.channels.cache.get(RANDOM_CHANNEL);
      if (!channel) return message.reply("Random channel not found.");

      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      await channel.send(msg);
    } catch {
      message.reply("Test failed.");
    }
    return;
  }

  /* -----------------------------------------------
     .bust COMMAND
  --------------------------------------------------- */
  if (message.content.startsWith(".bust")) {
    const target = message.mentions.users.first() || message.author;
    const scenario = BUST_SCENARIOS[Math.floor(Math.random() * BUST_SCENARIOS.length)];
    const gifPath = scenario.gif;

    try {
      if (fs.existsSync(gifPath)) {
        await message.channel.send({
          content: `<@${target.id}> ${scenario.message}`,
          files: [gifPath],
          allowedMentions: { users: [target.id] }
        });
      } else {
        await message.channel.send(`<@${target.id}> ${scenario.message}`);
      }
      return message.delete().catch(() => {});
    } catch (err) {
      console.error("❌ .bust error:", err);
      message.channel.send("Something went wrong.");
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
     HOT AUNTIES COMMAND
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
        files: [WELCOME_GIF]
      });
    }
    return del();
  }
});

/* ---------------------------------------------------
   READY EVENT + INITIAL RANDOM TIMER
--------------------------------------------------- */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  const sendRandom = async () => {
    if (!randomEnabled) return;

    try {
      const channel = client.channels.cache.get(RANDOM_CHANNEL);
      if (!channel) return;

      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      await channel.send(msg);

    } catch (err) {
      console.error("Random message error:", err);
    }
  };

  randomInterval = setInterval(sendRandom, 1.5 * 60 * 60 * 1000);
});

/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.BOT_TOKEN);
