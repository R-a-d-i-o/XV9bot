require('dotenv').config({ path: './env.txt' });
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const fs = require('fs');

/* --- CLIENT SETUP --- */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ],
});

/* --- CONFIG --- */
const WELCOME_CHANNEL_ID = "858382440241561611";
const WELCOME_GIF = './welcome gif.gif';
const BUST_SCENARIOS = [
  { message: "just got busted !!", gif: './captured.gif' },
  { message: "just busted !!", gif: './KINGDOM KAM.gif' }
];
const KINGDOM_GIF = './KINGDOM KAM.gif';

/* --- EXPRESS KEEP-ALIVE --- */
const app = express();
app.get('/', (_, res) => res.send("OK"));
app.listen(process.env.PORT || 3000, () => console.log("Keep-alive server running"));

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

/* --- MESSAGE COMMAND HANDLER --- */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const del = () => message.delete().catch(() => {});

  /* .ping */
  if (message.content === ".ping") {
    return message.channel.send("Pong! 🏓");
  }

  /* .bust */
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
        console.log(`⚠️ ${scenario.gif} not found, sent message without GIF`);
      }

      return del();
    } catch (err) {
      console.error("❌ .bust failed:", err);
      return message.channel.send("Something went wrong with .bust.");
    }
  }

  /* .kingdom or .kam */
  if ([".kingdom", ".kam"].includes(message.content)) {
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

  /* .hotauntiesnearme */
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

/* --- READY EVENT --- */
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  /* --- RANDOM MESSAGES EVERY 3 HOURS --- */
  const RANDOM_CHANNEL = "1440258431226478693";
  const RANDOM_MESSAGES = [
    "Get a load of this guy 🥀",
    "Sybau twin 💔",
    "Get a job 🥀",
    "👉 ⏱️",
    "yea no shit 🥀"
  ];

  setInterval(async () => {
    try {
      const channel = client.channels.cache.get(RANDOM_CHANNEL);
      if (!channel) return;

      const msg = RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)];
      await channel.send(msg);

      console.log(`🕒 Random message sent: ${msg}`);
    } catch (err) {
      console.error("Random message failed:", err);
    }
  }, 3 * 60 * 60 * 1000); // 3 hours
});

/* --- LOGIN --- */
client.login(process.env.BOT_TOKEN);
