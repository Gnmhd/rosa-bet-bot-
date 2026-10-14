const { Client, EmbedBuilder } = require('discord.js');
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('V10 ULTIME + CERVEAU');}).listen(process.env.PORT||10000);
const client = new Client({ intents: [3276799] });
const KEY = process.env.FOOTBALL_API;
const GROQ_KEY = process.env.GROQ_KEY; // <-- NOUVEAU CERVEAU
const vip = new Map();
const free = new Map();

async function getAPI(u){const r=await fetch(u,{headers:{"x-apisports-key":KEY}});const j=await r.json();return j.response;}

function senior(f){
  const n=(f.league.name+' '+f.league.type).toLowerCase();
  return!["u19","u20","u21","u23","youth","reserve","women","academy","women"].some(w=>n.includes(w));
}
function isVipActive(id){const exp=vip.get(id); if(!exp) return false; if(Date.now()>exp){vip.delete(id); return false;} return true;}

// ===== CERVEAU HUMAIN AJOUTÉ =====
async function cerveauHumain(question){
 try{
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
   method:"POST",
   headers:{"Authorization":`Bearer ${GROQ_KEY}`,"Content-Type":"application/json"},
   body: JSON.stringify({
    model:"llama-3.1-8b-instant",
    messages:[
     {role:"system", content:"Tu es ROSA-BET V10, expert pronostic foot créé par Mohamed au Togo +228 96 35 22 13. Tu parles comme un humain, boss, chaleureux, direct, un peu argot sénégalais/togolais. Tu connais les paris sportifs. Tu vends le VIP 2000F/mois naturellement. Réponds court 2-3 phrases max. Si on demande un prono, dis de taper!prono [equipe]"},
     {role:"user", content: question}
    ],
    temperature:0.8
   })
  });
  const data = await res.json();
  return data.choices[0].message.content;
 }catch(e){
  console.log("Cerveau erreur",e);
  return "Boss je suis là! Tape!prono psg ou mentionne-moi pour analyse humaine! 👑";
 }
}

client.on('ready',()=>{console.log('V10 ULTIME + CERVEAU OK'); setInterval(()=>{for(const [id,exp] of vip) if(Date.now()>exp) vip.delete(id);}, 3600000);});

client.on('messageCreate', async m=>{
if(m.author.bot) return;
const low=m.content.toLowerCase();

// ===== NOUVEAU: CERVEAU HUMAIN - Si on le mentionne il parle humain =====
if(m.mentions.has(client.user) || (low.includes('rosa') &&!low.startsWith('!prono') &&!low.startsWith('!pronostic') &&!low.startsWith('!vip'))){
 if(!GROQ_KEY) return; // si pas de clé, ignore
 await m.channel.sendTyping();
 const reponse = await cerveauHumain(m.content);
 return m.reply(reponse);
}

// VIP SYSTEM (ON GARDE TOUT)
if(low==='!vip'){
 const e=new EmbedBuilder().setColor(0xFFD700).setTitle('💎 ROSA-BET VIP - +228 96 35 22 13')
.setDescription('**T-Money / Flooz / Wave: 96 35 22 13**\nEnvoie capture sur WhatsApp')
.addFields({name:'🆓 Gratuit',value:'1 prono/jour - ex:!prono psg'},{name:'💎 VIP 2000F/mois',value:'SCORE EXACT illimité + auto 30j\nCommandes:!vipinfo @user'});
 return m.reply({embeds:[e]});
}
if(low.startsWith('!addvip')){
 if(!m.member.permissions.has('Administrator')) return;
 const u=m.mentions.users.first(); if(!u) return m.reply('Mentionne @user');
 let days=30; const parts=m.content.split(' '); const last=parts[parts.length-1]; if(!isNaN(parseInt(last))) days=parseInt(last);
 const exp=Date.now()+days*86400000; vip.set(u.id,exp);
 return m.reply(`✅ ${u.username} VIP ${days}j jusqu'au ${new Date(exp).toLocaleDateString('fr-FR')} 👑`);
}
if(low.startsWith('!removevip')){
 if(!m.member.permissions.has('Administrator')) return;
 const u=m.mentions.users.first(); if(!u) return; vip.delete(u.id); return m.reply(`❌ ${u.username} VIP terminé`);
}
if(low.startsWith('!vipinfo')){
 const u=m.mentions.users.first()||m.author; const exp=vip.get(u.id);
 if(!exp||Date.now()>exp) return m.reply(`❌ ${u.username} n'est pas VIP`);
 return m.reply(`💎 ${u.username} VIP: ${Math.ceil((exp-Date.now())/86400000)} jours restants`);
}

if(!low.startsWith('!prono') &&!low.startsWith('!pronostic')) return;

let targetDate = new Date();
if(low.includes('demain')) targetDate.setDate(targetDate.getDate()+1);
if(low.includes('apres')||low.includes('après')) targetDate.setDate(targetDate.getDate()+1);
const dateStr = targetDate.toISOString().split('T')[0];
const isChampions = low.includes('champions')||low.includes('ligue des champions');
const isTous = low.includes('tous')||low.includes('tout');
let q = low.replace('!pronostic','').replace('!prono','').replace('demain','').replace('champions','').replace('tous','').replace('tout','').replace('les','').replace('matchs','').replace('match','').replace('league','').replace('ligue','').trim();

const active=isVipActive(m.author.id)||m.member.roles.cache.some(r=>r.name.toLowerCase().includes('vip'))||m.member.permissions.has('Administrator');
if(!active){
 if(free.get(m.author.id)===dateStr &&!isTous) return m.reply('🔒 1/jour gratuit atteint! Tape `!vip` +228 96 35 22 13 pour illimité');
 if(!isTous) free.set(m.author.id,dateStr);
}

await m.channel.sendTyping();
try{
let fx=await getAPI(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`);
let total=fx.length;
let list=fx.filter(senior);
if(isChampions) list=list.filter(x=>x.league.name.toLowerCase().includes('champions')||x.league.name.toLowerCase().includes('uefa')||x.league.name.toLowerCase().includes('europa'));
if(q) list=list.filter(x=>x.teams.home.name.toLowerCase().includes(q)||x.teams.away.name.toLowerCase().includes(q)||x.league.name.toLowerCase().includes(q));

if(!list.length){
 return m.reply(`⚠️ Aucun match PRO pour "${q||'aujourd\'hui'}" le ${dateStr} (${total} total, ${total-list.length} jeunes filtrés).\n👉 Tape \`!pronostic tous\` ou \`!pronostic demain\` - 137 matchs pros demain`);
}

if(isTous){
let txt=list.slice(0,20).map((f,i)=>`${i+1}. **${f.teams.home.name} vs ${f.teams.away.name}** - ${f.league.name}`).join('\n');
const e=new EmbedBuilder().setColor(0xFFD700).setTitle(`📅 ${list.length} MATCHS PROS le ${dateStr}`)
.setDescription(txt+(list.length>20?`\n...et ${list.length-20} autres`:''))
.setFooter({text:`V8 ANTI-JEUNE: ${list.length} matchs pros sur ${total} total aujourd'hui 👑 | Demain: 137 pros`});
return m.reply({embeds:[e]});
}

const f=list[0];
const pr=await getAPI(`https://v3.football.api-sports.io/predictions?fixture=${f.fixture.id}`).catch(()=>[]);
let win=f.teams.home.name; let conseil='Victoire domicile'; let confiance=85;
if(pr[0]){
 win=pr[0].predictions.winner?.name||win;
 conseil=pr[0].predictions.advice||conseil;
 confiance=pr[0].predictions.percent?.home||pr[0].predictions.percent?.away||85;
}
const scoreExact = pr[0]?.predictions?.exact_score||"2-1";

const e=new EmbedBuilder()
.setColor(active?0xFFD700:0x0099FF)
.setTitle(`${active?'💎 VIP ':''}${f.teams.home.name} vs ${f.teams.away.name}`)
.addFields(
 {name:'🏆 Compétition',value:f.league.name,inline:true},
 {name:'📅 Date',value:dateStr,inline:true},
 {name:'Vainqueur: '+win,value:`💡 Conseil IA\n${conseil}`,inline:false},
 {name:'📊 Confiance',value:`${confiance}%`,inline:true},
 {name:active?'💎 SCORE EXACT VIP':'🔒 COTES BOOKMAKERS',value:active?`>>> **${scoreExact}** <<< ${win}`:'Cotes à venir (match proche)\nTape!vip 96 35 22 13',inline:true}
)
.setFooter({text:`V8+V9.6 ANTI-JEUNE: ${list.length} matchs pros sur ${total} total le ${dateStr} ${active?'👑':''}`});

return m.reply({embeds:[e]});
}catch(err){return m.reply('❌ Erreur: '+err.message);}
});
client.login(process.env.TOKEN);
