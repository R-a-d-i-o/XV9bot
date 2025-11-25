// FULL DISCORD BOT REWRITE WITH .warn, .kick, warn-tracking, and all requested features

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

function startRandomMessages(channel) {
  if (!randomEnabled) return;
  if (randomInterval) clearInterval(randomInterval);

  randomInterval = setInterval(() => {
    if (!randomEnabled) return;
    const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
    channel.send(msg);
  }, 2 * 60 * 60 * 1000); // 2 HOURS
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

  const content = message.content.toLowerCase();
  const channel = client.channels.cache.get(RANDOM_CHANNEL);

  /* DELETE user message for all commands EXCEPT: .diagnosis, .therapy, .norandom, .yesrandom */
  const noDelete = [".diagnosis", ".therapy", ".norandom", ".yesrandom"]; 

  function deleteIfAllowed(cmd) {
    if (!noDelete.includes(cmd)) message.delete().catch(() => {});
  }


  /* ---------------------------------------------------
     .warn @user  (2 warns = auto kick)
  --------------------------------------------------- */
  if (content.startsWith(".warn")) {
    deleteIfAllowed(".warn");

    const target = message.mentions.members.first();
    if (!target) return message.channel.send("Mention a user to warn.");

    const warnCount = warnUser(target.id);

    await message.channel.send(`${target}, baaz aaja , warna tujhe **PHANSI** lag jayegi`);

    if (warnCount >= 2) {
      await message.channel.send(`${target} ne 2 warnings kha li... **KICK TIME** 😭🔥`);
      target.kick("2 warnings reached").catch(() => {});
      warns[target.id] = 0; // reset
    }
    return;
  }

  /* ---------------------------------------------------
     .kick @user
     (same message as .ban message you had earlier)
  --------------------------------------------------- */
  if (content.startsWith(".kick")) {
    deleteIfAllowed(".kick");

    const target = message.mentions.members.first();
    if (!target) return message.channel.send("Mention a user to kick.");

    await message.channel.send(`💀 **${target.user.username} has been yeeted from the server** 💀`);
    target.kick("Manual kick").catch(() => {});
    return;
  }

  /* ---------------------------------------------------
     .bust COMMAND
  --------------------------------------------------- */
  if (content.startsWith(".bust")) {
    deleteIfAllowed(".bust");

    const user = message.mentions.users.first() || message.author;
    const s = BUST_SCENARIOS[Math.floor(Math.random() * BUST_SCENARIOS.length)];

    await message.channel.send({
      content: `<@${user.id}> ${s.message}`,
      files: [s.gif]
    });
    return;
  }

  /* ---------------------------------------------------
     .yesrandom / .norandom
  --------------------------------------------------- */
  if (content === ".yesrandom") {
    randomEnabled = true;
    message.channel.send("Random messages are now **ON**");
    startRandomMessages(channel);
    return;
  }

  if (content === ".norandom") {
    randomEnabled = false;
    clearInterval(randomInterval);
    message.channel.send("Random messages are now **OFF**");
    return;
  }

  /* ---------------------------------------------------
     .therapy (does NOT delete message)
  --------------------------------------------------- */
  if (content.startsWith(".therapy")) {
    const target = message.mentions.users.first() || message.author;

    const firstMsgs = [
      `🛋️ Let’s take it from the top, <@${target.id}>…`,
      `🧐 Okay <@${target.id}>, what exactly possessed you today?`,
      `💻 Tell me what’s going on in that brain of yours.`,
      `☕ Alright <@${target.id}>, spill the tea — what's bothering you?`,
      `🧪 Brain audit time, <@${target.id}>… explain yourself 🧠`
    ];

    const followUps = [
      // NEGATIVE/FUNNY
      "😤 I don’t get paid enough for this shit",
      "🫠 Bruh… your neuroses are flexing harder than your nonexistent libido",
      "🤖 I would have helped you, but even ChatGPT gave up",
      "💪 Brotha, you generated more stamina by fapping than any other sport… how TF am I supposed to help you?",

      // POSITIVE LINES
      "❤️ You need to spend more time with family <3",
      "🥰 Not all heroes wear capes… at least you tried",
      "🧸 Chill… it’s okay to be a little chaotic sometimes",
      "🌱 Maybe take a walk outside, could reboot the system",
      "🌙 Suffering is a valuable thing — without it, you cannot grow",
      "🌤️ You’re doing better than you think — don’t be so hard on yourself.",
      "🧠 Healing takes time, and you're doing fine.",
      "✨ It’s okay to feel lost — that's how you find new directions.",
      "🔥 You’ve pulled yourself together before — you can do it again.",
      "❤️ You deserve peace, even when your mind tells you otherwise."
    ];

    const msg1 = firstMsgs[Math.floor(Math.random() * firstMsgs.length)];
    const msg2 = followUps[Math.floor(Math.random() * followUps.length)];

    await message.channel.send(msg1);
    setTimeout(() => message.channel.send(msg2), 1500);
    return;
  }
});

/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.TOKEN);

