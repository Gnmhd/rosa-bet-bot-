const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

function genCode() {
  return "ROSA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getCoupons() {
  const codeSafe = genCode();
  const code20 = genCode();
  const code50 = genCode();

  return [
    {
      title: "COUPON SAFE - COTE 10",
      code: codeSafe,
      matches: "Man City Win + Arsenal Double Chance + Over 1.5 Leipzig",
      odds: "10.45",
      color: 0x2ECC71
    },
    {
      title: "COUPON COTE 20+",
      code: code20,
      matches: "Inter 1X + Barca BTTS + Real Over 2.5 + Score 2-1 Dortmund",
      odds: "22.30",
      color: 0xF1C40F
    },
    {
      title: "COUPON FUN - COTE 50+",
      code: code50,
      matches: "Score Exact 2-0 Bayern + Score 3-1 PSG + 2-2 Chelsea + 1-0 Juve",
      odds: "54.80",
      color: 0xE74C3C
    }
  ];
}

client.once('ready', () => {
  console.log(`V10.1 READY en tant que ${client.user.tag} - Node ${process.version}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase();

  if (content === '!coupons' || content === '!coupon' || content.includes('!coupon')) {
    const coupons = getCoupons();

    for (const c of coupons) {
      const embed = new EmbedBuilder()
       .setTitle(c.title)
       .setDescription(`**Matchs:**\n${c.matches}\n\n**Code:** \`${c.code}\`\n**Cote totale: ${c.odds}**\n\n*Analyse basee sur forme + domicile + H2H*`)
       .setColor(c.color)
       .setFooter({ text: "Rosa Bet - Aucun coupon 100% sur. Jouez responsable" })
       .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    }
  }
});

if (!TOKEN) {
  console.error("ERREUR: TOKEN manquant dans Render Environment Variables");
  process.exit(1);
}

client.login(TOKEN);
