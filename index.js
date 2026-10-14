const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('👑 ROSA-BET EMPIRE LIVE!');
}).listen(process.env.PORT || 10000);

const client = new Client({ intents: [3276799] });

// BASE DE DONNÉES DES PRONOS
const pronos = [
  { match: "Real Madrid vs Barça", prono: "Victoire Real + BTTS", cote: "2.85", confiance: "85%" },
  { match: "Man City vs Arsenal", prono: "Over 2.5 buts", cote: "1.95", confiance: "92%" },
  { match: "PSG vs Bayern", prono: "Les deux marquent - OUI", cote: "1.72", confiance: "88%" },
  { match: "Inter vs Milan", prono: "Double chance X2", cote: "1.65", confiance: "90%" },
];

client.on('ready', () => {
  console.log(`ROSA-BET ${client.user.tag} EST EN LIGNE 🔥`);
  client.user.setActivity("👑 EMPIRE EN LIGNE |!help");
});

client.on('messageCreate', msg => {
  if (msg.author.bot) return;
  const content = msg.content.toLowerCase();

  // COMMANDE!rosa
  if (content === '!rosa') {
    msg.reply('👑 **ROSA-BET EMPIRE EN LIGNE!** Prêt à encaisser boss? Tape `!help`');
  }

  // COMMANDE!help
  if (content === '!help') {
    const embed = new EmbedBuilder()
     .setColor(0xFFD700)
     .setTitle('👑 ROSA-BET - COMMANDES DE L\'EMPIRE')
     .setDescription('Bienvenue dans l\'Empire du cash!')
     .addFields(
        { name: '!rosa', value: 'Vérifier que le bot est LIVE', inline: true },
        { name: '!pronostic', value: 'Prono du jour 🔥', inline: true },
        { name: '!bankroll', value: 'Gestion de bankroll', inline: true },
        { name: '!help', value: 'Affiche ce menu', inline: true }
      )
     .setFooter({ text: 'ROSA-BET EMPIRE 👑' });
    msg.reply({ embeds: [embed] });
  }

  // COMMANDE!pronostic - LA PLUS IMPORTANTE
  if (content === '!pronostic' || content === '!prono') {
    const p = pronos[Math.floor(Math.random() * pronos.length)];
    const embed = new EmbedBuilder()
     .setColor(0x00FF00)
     .setTitle('🔥 PRONOSTIC DU JOUR - ROSA-BET')
     .addFields(
        { name: '⚽ Match', value: p.match, inline: false },
        { name: '🎯 Prono', value: `**${p.prono}**`, inline: true },
        { name: '💰 Cote', value: p.cote, inline: true },
        { name: '📊 Confiance', value: p.confiance, inline: true }
      )
     .setFooter({ text: 'Jouez responsable - ROSA-BET EMPIRE 👑' })
     .setTimestamp();
    msg.reply({ embeds: [embed] });
  }

  // COMMANDE!bankroll
  if (content === '!bankroll') {
    msg.reply('💰 **GESTION BANKROLL:**\n`Mise = 2% à 5% max de ta bankroll`\nEx: 100.000 CFA -> 2000 à 5000 CFA par prono\nOn vise le long terme, pas le one-shot! 👑');
  }
});

client.login(process.env.TOKEN);
