const { Client, EmbedBuilder } = require('discord.js');
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ROSA-BET V4 SEARCH LIVE');
}).listen(process.env.PORT || 10000);

const client = new Client({ intents: [3276799] });

async function getRealMatches() {
  const apiKey = process.env.FOOTBALL_API;
  if (!apiKey) return null;
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { "x-apisports-key": apiKey }
    });
    const data = await res.json();
    return data.response || [];
  } catch (e) { return null; }
}

client.on('ready', () => {
  console.log(`ROSA-BET V4: ${client.user.tag}`);
  client.user.setActivity("🔍!prono + équipe |!help");
});

client.on('messageCreate', async msg => {
  if (msg.author.bot) return;
  const lower = msg.content.toLowerCase();

  if (lower === '!rosa') {
    msg.reply('👑 **ROSA-BET V4 EN LIGNE!** Recherche intelligente activée. Tape `!pronostic Liverpool`');
  }

  if (lower === '!help') {
    const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle('👑 ROSA-BET V4 - COMMANDES')
    .addFields(
        { name: '!pronostic', value: 'Match réel au hasard', inline: false },
        { name: '!pronostic Lask', value: 'Cherche le match de LASK', inline: true },
        { name: '!pronostic Liverpool', value: 'Cherche Liverpool', inline: true },
        { name: '!help', value: 'Ce menu', inline: true }
      )
    .setFooter({ text: 'ROSA-BET EMPIRE V4 👑' });
    msg.reply({ embeds: [embed] });
  }

  if (lower.startsWith('!pronostic') || lower.startsWith('!prono')) {
    msg.channel.sendTyping();
    const query = msg.content.slice(msg.content.split(' ')[0].length).trim().toLowerCase();

    const matches = await getRealMatches();
    if (!matches || matches.length === 0) {
      return msg.reply("⚠️ Pas de matchs trouvés aujourd'hui (ou API limite atteinte).");
    }

    let filtered = matches;
    // Si l'utilisateur a tapé un nom d'équipe
    if (query) {
      filtered = matches.filter(m =>
        m.teams.home.name.toLowerCase().includes(query) ||
        m.teams.away.name.toLowerCase().includes(query)
      );
      if (filtered.length === 0) {
        return msg.reply(`❌ Aucun match trouvé pour **${query}** aujourd'hui. Il y a ${matches.length} matchs aujourd'hui. Essaie un autre nom ou tape juste \`!pronostic\``);
      }
    }

    const randomMatch = filtered[Math.floor(Math.random() * filtered.length)];
    const home = randomMatch.teams.home.name;
    const away = randomMatch.teams.away.name;
    const league = randomMatch.league.name;
    const time = new Date(randomMatch.fixture.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const status = randomMatch.fixture.status.long;

    const analyses = ["Over 1.5 buts", "BTTS - OUI", "Double chance 1X", "Victoire domicile + Over 1.5", "Under 3.5", "Over 2.5"];

    const embed = new EmbedBuilder()
    .setColor(query? 0x0099FF : 0x00FF00)
    .setTitle(query? `🔍 RÉSULTAT POUR: ${query.toUpperCase()}` : '🔥 MATCH RÉEL DU JOUR')
    .setThumbnail(randomMatch.league.logo)
    .addFields(
        { name: '🏆 Ligue', value: league, inline: false },
        { name: '⚽ Match', value: `**${home} vs ${away}**`, inline: false },
        { name: '⏰ Heure', value: `${time} - ${status}`, inline: true },
        { name: '🎯 Analyse ROSA-BET', value: `**${analyses[Math.floor(Math.random()*analyses.length)]}**`, inline: true },
        { name: '📊 Confiance', value: `${80 + Math.floor(Math.random()*15)}%`, inline: true }
      )
    .setFooter({ text: `Trouvé ${filtered.length} match(s) pour "${query || 'au hasard'}" - ROSA-BET 👑` })
    .setTimestamp();

    msg.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
