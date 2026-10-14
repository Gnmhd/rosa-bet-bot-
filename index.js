// ROSA-BET V11 ULTIME + CERVEAU HUMAIN + FIX ROMA
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

const app = express();
app.get('/', (req,res)=> res.send('V11 ULTIME + CERVEAU OK - Roma vs Real OK'));
app.listen(process.env.PORT || 3000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// ===== CONFIG =====
const FOOT_API = process.env.FOOT_API;
const GROQ_KEY = process.env.GROQ_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const VIP_FILE = './vip.json';
let vipData = {};
if(fs.existsSync(VIP_FILE)){
  try{ vipData = JSON.parse(fs.readFileSync(VIP_FILE)); }catch(e){ vipData={}; }
}
function saveVIP(){ fs.writeFileSync(VIP_FILE, JSON.stringify(vipData, null, 2)); }

// ===== CERVEAU HUMAIN GROQ =====
async function cerveauHumain(question){
  if(!GROQ_KEY) return "Boss mon cerveau n'est pas branché! Ajoute GROQ_KEY dans Render 😅";
  try{
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: GROQ_MODEL,
      messages: [
        {role:"system", content:"Tu es ROSA-BET, un parieur pro africain, expert en foot, drôle, humain, tu parles comme un jeune de Lomé, tu donnes des conseils paris mais tu rappelles que c'est risqué. Tu es vendeur VIP +228 96 35 22 13 mais pas spam. Réponds court, 2-4 lignes max, avec emojis."},
        {role:"user", content: question}
      ],
      temperature: 0.9,
      max_tokens: 300
    }, { headers:{ Authorization:`Bearer ${GROQ_KEY}`, 'Content-Type':'application/json' } });
    return res.data.choices[0].message.content;
  }catch(e){
    console.error("GROQ ERREUR:", e.response?.data || e.message);
    return "Aïe mon cerveau bug boss 😅 repose ta question!";
  }
}

// ===== FOOT API =====
async function getAPI(url){
  try{
    const r = await axios.get(url, { headers:{ 'x-apisports-key': FOOT_API } });
    return r.data.response || [];
  }catch(e){
    console.error("FOOT API ERREUR", e.response?.data || e.message);
    return [];
  }
}

function senior(f){
  try{
    const name = (f.league?.name||'').toLowerCase();
    const bad = ['u21','u19','u18','u17','u16','women','feminine','amateur','reserve','youth'];
    if(bad.some(b=> name.includes(b))) return false;
    return true;
  }catch{ return true; }
}

function fmtDate(d){
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const dd=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

function pronoFoot(home, away, league){
  // Logique simple V10
  const rand = Math.random();
  let tip = "";
  let conf = 65 + Math.floor(Math.random()*20);
  if(rand < 0.4) tip = `Victoire ${home} ou Nul (1X)`;
  else if(rand < 0.7) tip = `Les deux équipes marquent (BTTS OUI)`;
  else tip = `Over 2.5 buts`;

  return { tip, conf, score: "2-1 ou 1-1" };
}

// ===== MESSAGE HANDLER =====
client.on('messageCreate', async (m)=>{
  if(m.author.bot) return;
  const low = m.content.toLowerCase();

  // ===== CERVEAU HUMAIN - Mention ROSA-BET =====
  if(m.mentions.has(client.user)){
    await m.channel.sendTyping();
    const question = m.content.replace(/<@!?[0-9]+>/g,'').trim() || "Salut boss";
    const rep = await cerveauHumain(question);
    return m.reply(rep);
  }
  // Si on écrit "Rosa" sans commande pronostic
  if(low.includes('rosa') &&!low.startsWith('!prono') &&!low.startsWith('!vip') &&!low.startsWith('!addvip')){
    await m.channel.sendTyping();
    const rep = await cerveauHumain(m.content);
    return m.reply(rep);
  }

  // ===== COMMANDES PRONOSTIC =====
  if(!low.startsWith('!prono') &&!low.startsWith('!vip') &&!low.startsWith('!addvip')) return;

  // VIP CHECK etc...
  if(low.startsWith('!addvip')){
    if(!m.member.permissions.has('Administrator')) return m.reply('❌ Admin seulement boss');
    const user = m.mentions.users.first();
    if(!user) return m.reply('Mentionne:!addvip @user 7');
    const days = parseInt(m.content.split(' ')[2])||7;
    const until = Date.now() + days*24*3600*1000;
    vipData[user.id] = until;
    saveVIP();
    return m.reply(`✅ VIP
