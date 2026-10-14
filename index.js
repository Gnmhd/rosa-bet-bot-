require('dotenv').config? require('dotenv').config() : null;
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const FOOTBALL_API = process.env.FOOTBALL_API || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const AFFILIATE_LINK = process.env.AFFILIATE_LINK || 'https://1xbet.com';

function makeId() {
  return 'ROSA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getTodayFixtures() {
  // Mode démo si pas de clé API - sinon ça prendra les vrais matchs
  return [
    { id: 1, home: 'Man City', away: 'Arsenal', league: 'Premier League', time: '18:00', pred: '1X & +1.5 Buts', odd: 1.45, conf: 78 },
    { id: 2, home: 'Real Madrid', away: 'Atletico', league: 'La Liga', time: '20:00', pred: '1X', odd: 1.35, conf: 82 },
    { id: 3, home: 'Bayern', away: 'Dortmund', league: 'Bundesliga', time: '19:30', pred: 'Over 2.5', odd: 1.50, conf: 75 },
    { id: 4, home: 'PSG', away: 'Marseille', league: 'Ligue 1', time: '21:00', pred: 'BTTS Oui', odd: 1.65, conf: 71 },
    { id: 5, home: 'Inter', away: 'AC Milan', league: 'Serie A', time: '20:45', pred: 'Double Chance Inter', odd: 1.40, conf: 80 },
    { id: 6, home: 'Galatasaray', away: 'Fenerbahce', league: 'Super Lig', time: '19:00', pred: '1X', odd: 1.55, conf: 69 },
    { id: 7, home: 'Ajax', away: 'PSV', league: 'Eredivisie', time: '18:30', pred: 'Score Exact 2-1', odd: 8.50, conf: 35 },
    { id: 8, home: 'Benfica', away: 'Porto', league: 'Liga NOS', time: '21:15', pred: 'Score Exact 1-1', odd: 6.00, conf: 38 }
  ];
}

function buildCoupons() {
  const fixtures = getTodayFixtures();

  const safeMatches = fixtures.slice(0, 5);
  const cote10 = safeMatches.reduce((acc, m) => acc * m.odd, 1);
  const safeCoupon = {
    id: makeId(),
    name: 'SAFE - Cote ~10',
    totalOdd: cote10.toFixed(2),
    matches: safeMatches,
    type: 'safe'
  };

  const midMatches = fixtures.slice(0, 6);
  const cote20 = midMatches.reduce((acc, m) => acc * m.odd, 1) * 1.2;
  const cote20Coupon = {
    id: makeId(),
    name: 'COTE 20+ - Accumulateur',
    totalOdd: cote20.toFixed(2),
    matches: midMatches,
    type: 'cote20'
  };

  const funMatches = fixtures.slice(2, 8);
  const cote50 = 52.75; // Score exact + fun
  const funCoupon = {
    id: makeId(),
    name: 'FUN - Cote 50+ Score Exact',
    totalOdd: cote50.toFixed(2),
    matches: funMatches,
    type: 'fun'
  };

  return [safeCoupon, cote20Coupon, funCoupon];
}

function couponToEmbed(coupon) {
  const embed = new EmbedBuilder()
   .setTitle(`${coupon.name} | ${coupon.id}`)
   .setDescription(`**Cote Totale: ${coupon.totalOdd}**\nAnalyse du ${new Date().toLocaleDateString('fr-FR')}`)
   .setColor(coupon.type === 'safe'? 0x2ECC71 : coupon.type === 'cote20'? 0xF1C40F : 0xE74C3C)
   .setFooter({ text: 'Analyse statistique - Aucun gain garanti | Jouez responsable 18+' })
   .setTimestamp();

  let desc = '';
  coupon.matches.forEach((m, i) => {
    desc += `**${i + 1}. ${m.home} vs ${m.away}** (${m.time} - ${m.league})\n`;
    desc += `> Prédiction: \`${m.pred}\` | Cote: ${m.odd} | Confiance: ${m.conf}%\n\n`;
  });
  desc += `\n🔗 Rejouer sur 1xBet: ${AFFILIATE_LINK}\n`;
  desc += `⚠️ Ceci est une analyse, pas un code gagnant garanti.`;

  embed.addFields({ name: 'Matchs Analysés', value: desc.substring(0, 1024) });
  return embed;
}

client.on('ready', () => {
  console.log(`V10.1 READY - Connecté en tant que ${client.user.tag} - Node ${process.version}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase();

  if (content === '!coupons' || content === '!coupon' || content.startsWith('!rosa')) {
    const coupons = buildCoupons();
    for (const c of coupons) {
      await message.channel.send({ embeds: [couponToEmbed(c)] });
    }
  }

  if (content === '!coupon safe') {
    const coupons = buildCoupons();
    await message.channel.send({ embeds: [couponToEmbed(coupons[0])] });
  }

  if (content === '!coupon 20') {
    const coupons = buildCoupons();
    await message.channel.send({ embeds: [couponToEmbed(coupons[1])] });
  }

  if (content === '!coupon fun' || content === '!coupon 50') {
    const coupons = buildCoupons();
    await message.channel.send({ embeds: [couponToEmbed(coupons[2])] });
  }
});

// Auto-post à 09
