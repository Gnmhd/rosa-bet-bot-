// ROSA BET V10.1 - FIXED FOR RENDER
// Bot 3 coupons / jour : Safe x10 / Cote 20+ / Fun x50+ Score Exact
// Ne promet jamais 100% - Analyse seulement

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.TOKEN;
const FOOTBALL_API = process.env.FOOTBALL_API;
const CHANNEL_ID = process.env.CHANNEL_ID;
const AFFILIATE_LINK = process.env.AFFILIATE_LINK || "https://1xbet.com";

function generateCouponCode() {
    return "ROSA-" + Math.random().toString(36).substring(2, 8
