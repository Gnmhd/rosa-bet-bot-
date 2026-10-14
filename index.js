const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.on('ready', () => {
  console.log(`ROSA-BET ${client.user.tag} connectée - VERT EN LIGNE 🟢`);
});

client.on('messageCreate', (message) => {
  if (message.content === '!rosa') {
    message.reply('👑 ROSA-BET EMPIRE EST LÀ ! R-B EN LIGNE !');
  }
});

client.login(process.env.TOKEN);
