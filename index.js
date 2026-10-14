const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.TOKEN;
const FOOTBALL_API = process.env.FOOTBALL_API;
const CHANNEL_ID = process.env.CHANNEL_ID;
const AFFILIATE_LINK = process.env.AFFILIATE_LINK || 'https://1xbet.com';

function generateCouponCode() {
  return "ROSA-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString().slice(-4);
}

async function getMatches() {
  try {
    if (!FOOTBALL_API) {
      return [{ home: "Man City", away: "Arsenal", prediction: "1X", odd: 1.55, confiance: 78 }, { home: "Real Madrid", away: "Barca", prediction: "BTTS Oui", odd: 1.72, confiance: 72 }];
    }
    // Ici tu peux brancher API-Football plus tard
    return [];
  } catch (e) {
    console.log("Erreur API:", e.message);
    return [];
  }
}

function buildCoupons() {
  const codeSafe = generateCouponCode();
  const code20 = generateCouponCode();
  const codeFun = generateCouponCode();

  const safe = {
    nom: "🟢 COUPON SAFE DU JOUR - COTE 10",
    code: codeSafe,
    total: "9.85",
    matchs: [
      "Man City vs Arsenal -> 1X @1.45 (Forme domicile 
