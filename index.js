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
  }, 2 * 60 * 60 * 1000);
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
const warns = {}; // { userID: count }
function warnUser(userID) {
  if (!warns[userID]) warns[userID] = 0;
  warns[userID]++;
  return warns[userID];
}

/* ---------------------------------------------------
   WELCOME EVENT (FULLY FIXED)
--------------------------------------------------- */
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    let fileExists = fs.existsSync(WELCOME_GIF);

    await channel.send({
      content: `Welcome <@${member.id}>!! 👅`,
      files: fileExists ? [WELCOME_GIF] : [],
      allowedMentions: { users: [member.id] }
    });

  } catch (err) {
    console.error("❌ Welcome event error:", err);
  }
});

/* ---------------------------------------------------
   BOT READY
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

  const noDelete = [
    ".diagnose",
    ".therapy",
    ".norandom",
    ".yesrandom",
    ".ping",
    ".commands",
    ".hotauntiesnearme"
  ];

  function deleteIfAllowed(cmd) {
    if (!noDelete.includes(cmd)) message.delete().catch(() => {});
  }

  /* --------------------
     .warn @user
  -------------------- */
  if (content.startsWith(".warn")) {
    deleteIfAllowed(".warn");

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
     .kick @user
  -------------------- */
  if (content.startsWith(".kick")) {
    deleteIfAllowed(".kick");

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
    deleteIfAllowed(".bust");

    const user = message.mentions.users.first() || message.author;
    const scenario = BUST_SCENARIOS[Math.floor(Math.random() * BUST_SCENARIOS.length)];

    if (fs.existsSync(scenario.gif)) {
      await message.channel.send({
        content: `<@${user.id}> ${scenario.message}`,
        files: [scenario.gif],
        allowedMentions: { users: [user.id] }
      });
    } else {
      await message.channel.send(`<@${user.id}> ${scenario.message}`);
    }
    return;
  }

  /* --------------------
     .diagnose
  -------------------- */
  if (content.startsWith(".diagnose")) {
    const target = message.mentions.users.first() || message.author;

    const runningMsgs = [
      `🖥️ Checking <@${target.id}>’s braincache…`,
      `⚙️ Running diagnostics on <@${target.id}>…`,
      `🔍 Scanning <@${target.id}> for brain activity…`,
      `💀 Testing <@${target.id}>’s mental stability…`,
      `📡 Uploading <@${target.id}>’s stupidity levels…`,
      `🫠 Calculating goofiness index…`,
      `🧪 Performing cringe-level analysis…`,
      `🕵️‍♂️ Tracking missing neurons…`
    ];

    const finalConditions = [
      "Condition: skill issue",
      "Condition: Terminal Lobotomy",
      "Condition: Bitch Syndrome",
      "Condition: Severe Retard Syndrome",
      "Condition: Horny Havoc Syndrome",
      "Condition: Fapocalypse Syndrome"
    ];

    const running = runningMsgs[Math.floor(Math.random() * runningMsgs.length)];
    const condition = finalConditions[Math.floor(Math.random() * finalConditions.length)];

    await message.channel.send(running);
    setTimeout(() => {
      message.channel.send(condition);
    }, 1500);
    return;
  }

  /* --------------------
     .therapy
  -------------------- */
  if (content.startsWith(".therapy")) {
    const target = message.mentions.users.first() || message.author;

    const firstMsgs = [
      `🛋️ Let's take it from the top, <@${target.id}>…`,
      `🧐 Okay <@${target.id}>, what possessed you today?`,
      `💻 Tell me what's going on in your brain.`,
      `☕ Alright <@${target.id}>, spill the tea.`,
      `🧪 Brain audit time… explain yourself.`
    ];

    const followUps = [
      "😤 I don’t get paid enough for this shit",
      "🫠 Your neuroses are flexing harder than your libido",
      "🤖 Even ChatGPT gave up on you",
      "💪 Bro faps harder than he tries in life",
      "❤️ Spend more time with family <3",
      "🥰 At least you tried",
      "🧸 Chill… it's okay",
      "🌱 Go touch grass",
      "🌙 Suffering = growth",
      "✨ You're doing better than you think",
      "🔥 You've survived worse",
      "❤️ You deserve peace",
    ];

    const msg1 = firstMsgs[Math.floor(Math.random() * firstMsgs.length)];
    await message.channel.send(msg1);

    const filter = m => m.author.id === target.id;
    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });

    collector.on("collect", () => {
      const msg2 = followUps[Math.floor(Math.random() * followUps.length)];
      message.channel.send(msg2);
    });

    return;
  }

  /* --------------------
     .yesrandom / .norandom
  -------------------- */
  if (content === ".yesrandom") {
    randomEnabled = true;
    message.channel.send("Random messages are now **ON**");
    if (channel) startRandomMessages(channel);
    return;
  }

  if (content === ".norandom") {
    randomEnabled = false;
    clearInterval(randomInterval);
    message.channel.send("Random messages are now **OFF**");
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
    const commandsWithDescriptions = [
      "**.ping** – Bot check",
      "**.mem** – Server member count",
      "**.pfp [@user]** – Sends profile picture",
      "**.bust [@user]** – Busted GIF",
      "**.diagnose [@user]** – Funny diagnosis",
      "**.therapy [@user]** – Therapy session",
      "**.norandom** – Turn OFF random messages",
      "**.yesrandom** – Turn ON random messages",
      "**.hotauntiesnearme** – Hot aunties joke",
      "**.warn [@user]** – Warn system",
      "**.kick [@user]** – Kick user"
    ];
    message.channel.send(`Available commands:\n${commandsWithDescriptions.join("\n")}`);
    return;
  }

  /* --------------------
     .hotauntiesnearme
  -------------------- */
  if (content.startsWith(".hotauntiesnearme")) {
    const hotNumbers = ["03075386948","03410014849","03000540786","03117078408","03098129729"];
    const hotMessages = [
      "{number} wants some gawk gawk 😍",
      "{number} is feeling freaky 😍",
      "{number} is horny tonight 😈",
      "{number} will choke ur meat 😈",
      "{number} ready for 3some 😏"
    ];
    const num = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
    const msg = hotMessages[Math.floor(Math.random() * hotMessages.length)];
    message.channel.send(msg.replace("{number}", num));
    return;
  }

});

/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.TOKEN);
