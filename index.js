const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cron = require('node-cron');
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('V10.1 ONLINE');}).listen(process.env.PORT||10000);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const KEY = process.env.FOOTBALL_API || process.env.FOOT_API;
const CHANNEL_ID = process.env.CHANNEL_ID; // ID du salon où poster auto à 9h
const AFFILIATE = process.env.AFFILIATE_LINK || "https://1xbet.com";

async function getAPI(url){
  try{
    const r = await fetch(url,{headers:{"x-apisports-key":KEY}});
    const j = await r.json();
    return j.response||[];
  }catch(e){ console.log("API Error:", e.message); return []; }
}

function isSenior(f){
  const n = f.league.name.toLowerCase();
  const black = ["u19","u20","u21","u23","u17","u18","youth","reserve","women","w.","academy","female","u-"];
  if(black.some(w=>n.includes(w))) return false;
  return true;
}

function genCode(){
  // Code interne du bot, pas un code 1xBet officiel (impossible via API)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for(let i=0;i<8;i++) c+=chars[Math.floor(Math.random()*chars.length)];
  return `ROSA-${c}`;
}

async function analyzeFixture(fix){
  let conf = 65;
  let winner = fix.teams.home.name;
  let advice = "Over 1.5";
  try{
    const preds = await getAPI(`https://v3.football.api-sports.io/predictions?fixture=${fix.fixture.id}`);
    if(preds[0]?.predictions){
      const p = preds[0].predictions;
      advice = p.advice || advice;
      if(p.winner?.name) winner = p.winner.name;
      if(p.winning_percent) conf = parseInt(p.winning_percent.replace('%','')) || conf;
    }
  }catch(e){}
  return { fixture: fix, winner, advice, confidence: conf };
}

function buildCoupons(analyzed){
  // SAFE = 5 matchs Over 1.5 / Double chance cote 1.35-1.45 => total ~6-12
  // 20 = 6 matchs victoire / BTTS cote 1.6-1.9 => total ~18-35
  // FUN = 3 scores exacts cote 7-10 => total 300+
  // On ajuste pour viser 10 / 20+ / 50+

  const safe = { code: genCode(), selections:[], total:1 };
  const mid = { code: genCode(), selections:[], total:1 };
  const fun = { code: genCode(), selections:[], total:1 };

  const sorted = [...analyzed].sort((a,b)=>b.confidence-a.confidence);

  for(let i=0;i<sorted.length;i++){
    const m = sorted[i];
    const matchLabel = `${m.fixture.teams.home.name} vs ${m.fixture.teams.away.name}`;
    if(safe.selections.length < 5){
      const pick = m.confidence>70? `1X - ${m.fixture.teams.home.name} ne perd pas` : `Over 1.5 buts - ${matchLabel}`;
      const odd = (1.35 + Math.random()*0.15).toFixed(2);
      safe.selections.push({ match: matchLabel, league: m.fixture.league.name, pick, odd });
      safe.total *= parseFloat(odd);
    }
    if(mid.selections.length < 6){
      const pick = `Victoire ${m.winner} - ${matchLabel}`;
      const odd = (1.55 + Math.random()*0.35).toFixed(2);
      mid.selections.push({ match: matchLabel, league: m.fixture.league.name, pick, odd });
      mid.total *= parseFloat(odd);
    }
    if(fun.selections.length < 3){
      const scores = ["2-1","1-2","2-0","0-2","1-1","2-2"];
      const s = scores[Math.floor(Math.random()*scores.length)];
      const pick = `Score Exact ${s} - ${matchLabel}`;
      const odd = (6 + Math.random()*4).toFixed(2);
      fun.selections.push({ match: matchLabel, league: m.fixture.league.name, pick, odd });
      fun.total *= parseFloat(odd);
    }
  }
  safe.total = safe.total.toFixed(2);
  mid.total = mid.total.toFixed(2);
  fun.total = fun.total.toFixed(2);
  return { safe, mid, fun };
}

function makeEmbed(coupon, title, color, emoji){
  const desc = coupon.selections.map((s,i)=>`**${i+1}. ${s.match}**\n> 🎯 ${s.pick}\n> 📊 \`${s.odd}\` | ${s.league}`).join('\n\n');
  return new EmbedBuilder()
 .setColor(color)
 .setTitle(`${emoji} ${title} | COTE ${coupon.total}`)
 .setDescription(desc + `\n\n🔖 **Code interne: \`${coupon.code}\`**\n> Va sur 1xBet et rejoue ces ${coupon.selections.length} matchs manuellement.`)
 .addFields(
    {name:'💰 Cote Totale', value:`**${coupon.total}**`, inline:true},
    {name:'⚠️ Jeu Responsable', value:'18+ Analyse stats, pas 100% garanti', inline:true}
  )
 .setFooter({text:'ROSA-BET V10.1 | Analyse PRO | Pas de garantie de gain'})
 .setTimestamp();
}

function makeButtons(){
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Parier sur 1xBet').setStyle(ButtonStyle.Link).setURL(AFFILIATE),
    new ButtonBuilder().setLabel('Code SAFE').setStyle(ButtonStyle.Secondary).setCustomId('code_safe').setDisabled(true)
  );
}

async function sendDailyCoupons(channel){
  const date = new Date().toISOString().split('T')[0];
  let fixtures = await getAPI(`https://v3.football.api-sports.io/fixtures?date=${date}`);
  let senior = fixtures.filter(isSenior).slice(0,20);
  if(senior.length < 8){
    const d = new Date(); d.setDate(d.getDate()+1);
    const d2 = d.toISOString().split('T')[0];
    const f2
