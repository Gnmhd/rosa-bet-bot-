const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [3276799]
});

client.on('ready', () => {
  console.log(`ROSA-BET ${client.user.tag} est EN LIGNE 🟢`);
});

client.on('messageCreate', msg => {
  if (msg.content === '!rosa') msg.reply('👑 ROSA-BET EMPIRE EN LIGNE!');
});

client.login(process.env.TOKEN);
