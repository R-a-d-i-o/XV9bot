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
   RANDOM MESSAGE TOGGLE
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
  if (message.author.bot) return; // ignore bot messages

  const rawContent = message.content;
  const content = rawContent.toLowerCase();
  const channel = client.channels.cache.get(RANDOM_CHANNEL);

  // Commands whose messages should NOT be deleted
  const noDelete = [".diagnose", ".therapy", ".norandom", ".yesrandom"];
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

    const warnCount = warnUser(target.id);

    if (warnCount === 1) {
      await message.channel.send(`${target.user.username} ko **PHANSI** mubarak ho`);
    } else if (warnCount >= 2) {
      await message.channel.send(`${target.user.username} ko **PHANSI** mubarak ho`);
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
      `🖥️ Checking <@${target.id}>’s braincache for corrupted files…`,
      `⚙️ Running diagnostics on <@${target.id}>…`,
      `🔍 Scanning <@${target.id}> for brain activity…`,
      `💀 Testing <@${target.id}>’s mental stability… results not looking good`,
      `📡 Uploading <@${target.id}>’s stupidity levels to the Chat GPT…`,
      `🫠 Calculating goofiness index for <@${target.id}>…`,
      `🧪 Performing cringe-level analysis on <@${target.id}>…`,
      `🕵️‍♂️ Tracking missing neurons in <@${target.id}>’s brain…`
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
    setTimeout(async () => {
      await message.channel.send(condition);
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
      `🧐 Okay <@${target.id}>, what exactly possessed you today?`,
      `💻 Tell me what's going on in your brain.`,
      `☕ Alright <@${target.id}>, spill the tea — what's bothering you?`,
      `🧪 Brain audit time, <@${target.id}>… explain yourself 🧠`
    ];

    const followUps = [
      // Negative
      "😤 I don’t get paid enough for this shit",
      "🫠 Bruh… your neuroses are flexing harder than your nonexistent libido",
      "🤖 I would have helped you, but even ChatGPT gave up",
      "💪 Brotha, you generated more stamina by fapping than any other sport… how TF am I supposed to help you?",

      // Positive
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

    // Send first, wait for user reply before follow-up
    await message.channel.send(msg1);

    const filter = m => m.author.id === target.id;
    const collector = message.channel.createMessageCollector({ filter, max: 1, time: 300000 });

    collector.on("collect", async () => {
      const msg2 = followUps[Math.floor(Math.random() * followUps.length)];
      await message.channel.send(msg2);
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
    deleteIfAllowed(".ping");
    message.channel.send("Pong! 🏓");
    return;
  }

  /* --------------------
     .mem
  -------------------- */
  if (content === ".mem") {
    deleteIfAllowed(".mem");
    message.channel.send(`Total members: ${message.guild.memberCount}`);
    return;
  }

  /* --------------------
     .pfp
  -------------------- */
  if (content.startsWith(".pfp")) {
    deleteIfAllowed(".pfp");
    const user = message.mentions.users.first() || message.author;
    message.channel.send({ files: [user.displayAvatarURL({ size: 512, dynamic: true })] });
    return;
  }

  /* --------------------
     .commands
  -------------------- */
  if (content === ".commands") {
    const commandsWithDescriptions = [
      "**.ping** – Checks if the bot is online. Replies with Pong! 🏓",
      "**.mem** – Shows total members in the server.",
      "**.pfp [@user]** – Sends profile picture of a user or yourself.",
      "**.bust [@user]** – Sends a random 'busted' message and GIF to a user.",
      "**.diagnose [@user]** – Runs a funny random 'diagnosis' on a user.",
      "**.therapy [@user]** – Starts a therapy interaction; follow-up after user reply.",
      "**.norandom** – Stops the bot from sending automatic random messages.",
      "**.yesrandom** – Re-enables random messages and sends one immediately.",
      "**.hotauntiesnearme** – Sends a random funny 'hot aunties' message.",
      "**.warn [@user]** – Warns a user; 2 warnings = auto-kick",
      "**.kick [@user]** – Kicks a user manually"
    ];
    message.channel.send(`Available commands:\n${commandsWithDescriptions.join("\n")}`);
    return;
  }

  /* --------------------
     .hotauntiesnearme
  -------------------- */
  if (content.startsWith(".hotauntiesnearme")) {
    deleteIfAllowed(".hotauntiesnearme");

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

    message.channel.send(msg.replace("{number}", num));
    return;
  }

});
/* ---------------------------------------------------
   LOGIN
--------------------------------------------------- */
client.login(process.env.TOKEN);
