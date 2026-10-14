const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');

// Petit serveur pour que Render soit content
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('👑 ROSA-BET EMPIRE EST EN LIGNE!');
}).listen(process.env.PORT || 10000);

const client = new Client({
  intents: [3276799]
});

client.on('ready', () => {
  console.log(`ROSA-BET ${client.user.tag} est EN LIGNE`);
});

client.on('messageCreate', msg => {
  if (msg.content === '!rosa') msg.reply('👑 ROSA-BET EMPIRE EN LIGNE!');
});

client.login(process.env.TOKEN);
