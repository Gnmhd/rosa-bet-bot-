const { Client, EmbedBuilder } = require('discord.js');
const http = require('http');

http.createServer((req,res)=>{res.writeHead(200);res.end('ROSA-BET V6 SCORE EXACT');}).listen(process.env.PORT||10000);

const client = new Client({ intents: [3276799] });
const API_KEY = process.env.FOOTBALL_API;
const BASE = "https://v3.football.api-sports.io";

async function api(path){
  const r = await fetch(`${BASE}${path}`,{headers:{"x-apisports-key":API_KEY}});
  const j = await r.json();
  return j.response;
}

client.on('ready',()=>{console.log(`V6 ${client.user.tag}`);client.user.setActivity("🎯 SCORE EXACT |!prono");});

client.on('messageCreate', async msg=>{
  if(msg.author.bot) return;
  const content = msg.content;
  const lower = content.toLowerCase();

  if(lower==='!rosa') return msg.reply('👑 **ROSA-BET V6 SCORE EXACT LIVE!**');

  if(lower==='!help'){
    const e = new EmbedBuilder().setColor(0xFFD700).setTitle('👑 ROSA-BET V6').addFields(
      {name:'!pronostic Roma',value:'Match + SCORE EXACT + Cotes',inline:false},
      {name:'!prono exact Roma',value:'Uniquement le score exact',inline:false}
    );
    return msg.reply({embeds:[e]});
  }

  if(lower.startsWith('!pronostic') || lower.startsWith('!prono')){
    msg.channel.sendTyping();
    const query = content.slice(content.split(' ')[0].length).trim().toLowerCase();
    const isExact = lower.includes('exact');

    const today = new Date().toISOString().split('T')[0];
    let fixtures = await api(`/fixtures?date=${today}`);
    if(!fixtures?.length) return msg.reply("⚠️ Pas de matchs aujourd'hui");

    let filtered = fixtures;
    if(query && query!=='exact') filtered = fixtures.filter(m=>m.teams.home.name.toLowerCase().includes(query)||m.teams.away.name.toLowerCase().includes(query));
    if(!filtered.length) return msg.reply(`❌ Aucun match pour ${query}`);

    const f = filtered[Math.floor(Math.random()*filtered.length)];

    // ON CHERCHE LA PREDICTION SCORE EXACT
    const [pred, odds, h2h] = await Promise.all([
      api(`/predictions?fixture=${f.fixture.id}`).catch(()=>[]),
      api(`/odds?fixture=${f.fixture.id}`).catch(()=>[]),
      api(`/fixtures/headtohead?h2h=${f.teams.home.id}-${f.teams.away.id}`).catch(()=>[])
    ]);

    const prediction = pred?.[0]?.predictions;
    const scoreExact = prediction?.exact_score || `${Math.floor(Math.random()*3)+1}-${Math.floor(Math.random()*2)+1}`;
    const winner = prediction?.winner?.name || f.teams.home.name;
    const winOrDraw = prediction?.win_or_draw || true;
    const underOver = prediction?.under_over || "Over 2.5";
    const advice = prediction?.advice || "Over 1.5 buts";

    const homePct = pred?.[0]?.comparison?.form?.home?.slice(-5) || "50%";
    const awayPct = pred?.[0]?.comparison?.form?.away?.slice(-5) || "50%";
    const pourcVictoire = pred?.[0]?.comparison?.total?.home || "55%";

    const cote = odds?.[0]?.bookmakers?.[0]?.bets?.find
