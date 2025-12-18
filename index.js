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
const WELCOME_GIF = './fraky.gif';

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
   RANDOM SYSTEM
--------------------------------------------------- */
let randomEnabled = true;
let randomInterval = null;

function startRandomMessages(channel) {
  if (!randomEnabled) return;
  if (randomInterval) clearInterval(randomInterval);

  randomInterval = setInterval(() => {
    if (!randomEnabled) return;
    const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
    channel.send(msg);
  }, 5 * 60 * 60 * 1000);
}

/* ---------------------------------------------------
   EXPRESS KEEP-ALIVE
--------------------------------------------------- */
const app = express();
app.get('/', (_, res) => res.send("OK"));
app.listen(3000, () => console.log("Bot active"));

/* ---------------------------------------------------
   WARN SYSTEM
--------------------------------------------------- */
const warns = {};
function warnUser(userID) {
  if (!warns[userID]) warns[userID] = 0;
  warns[userID]++;
  return warns[userID];
}

/* ---------------------------------------------------
   WELCOME EVENT
--------------------------------------------------- */
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    await channel.send({
      content: `Welcome <@${member.id}>!! 👅`,
      files: fs.existsSync(WELCOME_GIF) ? [WELCOME_GIF] : [],
      allowedMentions: { users: [member.id] }
    });
  } catch (err) {
    console.error("Welcome error:", err);
  }
});

/* ---------------------------------------------------
   READY
--------------------------------------------------- */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.get(RANDOM_CHANNEL);
  if (channel) startRandomMessages(channel);
});

/* ---------------------------------------------------
   MESSAGE HANDLER
--------------------------------------------------- */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const rawContent = message.content.trim();
  const content = rawContent.toLowerCase();
  const channel = client.channels.cache.get(RANDOM_CHANNEL);

  /* --------------------
     .warn
  -------------------- */
  if (content.startsWith(".warn")) {
    await message.delete().catch(() => {});
    const target = message.mentions.members.first();
    if (!target) return message.channel.send("Mention a user to warn.");

    const count = warnUser(target.id);
    await message.channel.send(`${target.user.username} ko **PHANSI** mubarak ho`);

    if (count >= 2) {
      target.kick("2 warnings reached").catch(() => {});
      warns[target.id] = 0;
    }
    return;
  }

  /* --------------------
     .kick
  -------------------- */
  if (content.startsWith(".kick")) {
    await message.delete().catch(() => {});
    const target = message.mentions.members.first();
    if (!target) return message.channel.send("Mention a user to kick.");

    await message.channel.send(`${target.user.username} ko **PHANSI** mubarak ho`);
    target.kick("Manual kick").catch(() => {});
    return;
  }

  /* --------------------
     .bust
  -------------------- */
  if (content.startsWith(".bust")) {
    await message.delete().catch(() => {});
    const user = message.mentions.users.first() || message.author;
    const scenario = BUST_SCENARIOS[Math.floor(Math.random() * BUST_SCENARIOS.length)];

    await message.channel.send({
      content: `<@${user.id}> ${scenario.message}`,
      files: fs.existsSync(scenario.gif) ? [scenario.gif] : [],
      allowedMentions: { users: [user.id] }
    });
    return;
  }

  /* --------------------
     .diagnose
  -------------------- */
  if (content.startsWith(".diagnose")) {
    const target = message.mentions.users.first() || message.author;
    const running = [
      `🖥️ Checking <@${target.id}>’s braincache…`,
      `⚙️ Running diagnostics on <@${target.id}>…`,
      `🔍 Scanning <@${target.id}> for brain activity…`,
      `💀 Testing <@${target.id}>’s mental stability…`
    ];
    const conditions = [
      "Condition: skill issue",
      "Condition: Terminal Lobotomy",
      "Condition: Horny Havoc Syndrome"
    ];

    await message.channel.send(running[Math.floor(Math.random() * running.length)]);
    setTimeout(() => {
      message.channel.send(conditions[Math.floor(Math.random() * conditions.length)]);
    }, 1500);
    return;
  }

  /* --------------------
     .therapy
  -------------------- */
  if (content.startsWith(".therapy")) {
    const target = message.mentions.users.first() || message.author;
    await message.channel.send(`🛋️ Sit down <@${target.id}>…`);
    return;
  }

  /* --------------------
     .ping
  -------------------- */
  if (content === ".ping") {
    message.channel.send("Pong! 🏓");
    return;
  }

  /* --------------------
     .mem
  -------------------- */
  if (content === ".mem") {
    message.channel.send(`Total members: ${message.guild.memberCount}`);
    return;
  }

  /* --------------------
     .pfp
  -------------------- */
  if (content.startsWith(".pfp")) {
    const user = message.mentions.users.first() || message.author;
    message.channel.send({ files: [user.displayAvatarURL({ size: 512, dynamic: true })] });
    return;
  }

  /* --------------------
     .commands
  -------------------- */
  if (content === ".commands") {
    message.channel.send([
      ".ping",
      ".mem",
      ".pfp [@user]",
      ".bust [@user]",
      ".diagnose [@user]",
      ".therapy [@user]",
      ".warn [@user]",
      ".kick [@user]",
      ".hotauntiesnearme"
    ].join("\n"));
    return;
  }

  /* --------------------
     .hotauntiesnearme (FIXED)
  -------------------- */
  if (rawContent.startsWith(".hotauntiesnearme")) {
    await message.delete();

    const hotNumbers = [
      "03075386948",
      "03410014849",
      "03000540786",
      "03117078408",
      "03098129729"
    ];

    const hotMessages = [
      "{number} wants some gawk gawk 😍",
      "{number} is feeling freaky 😍",
      "{number} is horny tonight 😈",
      "{number} will choke ur meat 😈",
      "{number} ready for 3some 😏"
    ];

    const num = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
    const msg = hotMessages[Math.floor(Math.random() * hotMessages.length)];

    await message.channel.send(msg.replace("{number}", num));
    return;
  }
});

/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.TOKEN);
