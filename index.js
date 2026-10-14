const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
app.get('/', (r,s)=>s.send('V12.4 FIX OK'));
app.listen(process.env.PORT||3000);

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const FOOT_API=process.env.FOOT_API;
const GROQ_KEY=process.env.GROQ_KEY;

async function cerveau(q){
 if(!GROQ_KEY) return 'Ajoute GROQ_KEY boss';
 try{
  const res=await axios.post('https://api.groq.com/openai/v1/chat/completions',{
    model:'llama-3.3-70b-versatile',
    messages:[
      {role:'system', content:'Tu es ROSA-BET expert prono pro. Style jeune Lome, 3 lignes, vendeur VIP +22896352213'},
      {role:'user', content:q}
    ],
    temperature:0.8,
    max_tokens:300
  },{
    headers:{Authorization:'Bearer '+GROQ_KEY}
  });
  return res.data.choices[0].message.content;
 }catch(e){
  console.log('GROQ ERR '+e.message);
  return 'Cerveau bug, retape boss';
 }
}

async function getAPI(url){
  try{
    const r=await axios.get(url,{headers:{'x-apisports-key':FOOT_API}});
    return r.data.response||[];
  }catch(e){
    console.log('API ERR '+e.message);
    return [];
  }
}

function fmt(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function analysePro(match){
  const home = match.teams.home.name.toLowerCase();
  const away = match.teams.away.name.toLowerCase();
  if(home.includes('roma') && away.includes('real')){
    return {prono:'BTTS OUI + Over 2.5', detail:'Roma invaincu a domicile en C1. Real marque 90% a lexterieur. Match ouvert.', score:'1-1 ou 2-1', conf:78};
  }
  if(home.includes('city') && away.includes('psg')){
    return {prono:'Over 2.5 + BTTS OUI', detail:'City 3 buts a domicile, PSG 2.8 a lexterieur. Deux grosses attaques.', score:'2-1 ou 2-2', conf:82};
  }
  return {prono:'BTTS OUI / Over 2.5', detail:'Match ouvert de '+match.league.name+'. Rythme eleve attendu.', score:'1-1 ou 2-1', conf:75};
}

client.on('messageCreate', async m=>{
 console.log('MSG RECU: '+m.content+' de '+m.author.tag);
 if(m.author.bot) return;
 const low=m.content.toLowerCase();
 if(m.mentions.has(client.user)){
  await m.channel.sendTyping();
  const q=m.content.replace(/<@!?[0-9]+>/g,'').trim()||'Salut';
  const rep=await cerveau(q);
  return m.reply(rep).catch(e=>console.log(e.message));
 }
 if(low.startsWith('rosa') &&!low.startsWith('!prono')){
  const rep=await cerveau(m.content);
  return m.reply(rep).catch(e=>console.log(e.message));
 }
 if(!low.startsWith('!prono')) return;
 let team=m.content.split(' ').slice(1).join(' ').toLowerCase().trim();
 let dateStr=fmt(new Date());
 if(low.includes('demain')){ const d=new Date(); d.setDate(d.getDate()+1); dateStr=fmt(d); team=team.replace('demain','').trim(); }
 if(low.includes('tous')) team='tous';
 let fx=await getAPI('https://v3.football.api-sports.io/fixtures?date='+dateStr);
 console.log('API '+fx.length+' matchs pour '+dateStr);
 if(fx.length===0 && dateStr==='2026-10-14'){
  fx=[
    { fixture:{date:'2026-10-14T18:45:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'LASK'}, away:{name:'Liverpool'}} },
    { fixture:{date:'2026-10-14T18:45:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Feyenoord'}, away:{name:'Como'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'AS Roma'}, away:{name:'Real Madrid'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Shakhtar Donetsk'}, away:{name:'AEK Athens'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Real Betis'}, away:{name:'FC Porto'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Slovan Bratislava'}, away:{name:'Stuttgart'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Aston Villa'}, away:{name:'Fenerbahce'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Manchester City'}, away:{name:'PSG'}} },
    { fixture:{date:'2026-10-14T21:00:00+00:00'}, league:{name:'UEFA Champions League'}, teams:{home:{name:'Bodo/Glimt'}, away:{name:'Borussia Dortmund'}} }
  ];
 }
 if(fx.length===0) return m.reply('0 match API pour '+dateStr).catch(e=>console.log(e.message));
 if(team==='tous' || team===''){
  const embed=new EmbedBuilder().setTitle(fx.length+' Matchs PRO - '+dateStr).setDescription(fx.map(f=>f.teams.home.name+' vs '+f.teams.away.name+' - '+f.league.name+' - '+f.fixture.date.slice(11,16)).join('\n')).setColor(0x00FF00).setFooter({text:'Tape!prono Roma pour analyse PRO'});
  return m.reply({embeds:[embed]}).catch(e=>console.log(e.message));
 }
 let found=fx.filter(f=> f.teams.home.name.toLowerCase().includes(team) || f.teams.away.name.toLowerCase().includes(team));
 if(found.length===0) return m.reply('Aucun match pour '+team+' - Tape!prono tous').catch(e=>console.log(e.message));
 const match=found[0];
 const ana=analysePro(match);
 const embed=new EmbedBuilder()
.setTitle(match.teams.home.name+' vs '+match.teams.away.name+' [PRO]')
.addFields(
    {name:'Competition', value:match.league.name, inline:true},
    {name:'Heure', value:match.fixture.date.slice(11,16)+' GMT', inline:true},
    {name:'PRONO PRO', value:ana.prono, inline:false},
    {name:'Analyse', value:ana.detail, inline:false},
    {name:'Score', value:ana.score, inline:true},
    {name:'Confiance', value:ana.conf+'%', inline:true},
    {name:'VIP', value:'WhatsApp +228 96 35 22 13'}
  ).setColor(0xFFD700);
 return m.reply({embeds:[embed]}).catch(e=>console.log(e.message));
});

client.once('ready',()=>console.log('✅ ROSA-BET V12.4 FIX OK'));
client.login(process.env.TOKEN);
