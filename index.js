const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const app = express();
app.get('/', (r,s)=>s.send('V11.1 OK'));
app.listen(process.env.PORT||3000);
const client = new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers]});
const FOOT_API=process.env.FOOT_API;
const GROQ_KEY=process.env.GROQ_KEY;
async function cerveau(q){
 if(!GROQ_KEY) return "Ajoute GROQ_KEY boss 😅";
 try{
  const res=await axios.post('https://api.groq.com/openai/v1/chat/completions',{model:"llama-3.3-70b-versatile",messages:[{role:"system",content:"Tu es ROSA-BET parieur pro africain, drôle, humain, vendeur VIP +22896352213, 2-3 lignes max."},{role:"user",content:q}],temperature:0.9,max_tokens:250},{headers:{Authorization:`Bearer ${GROQ_KEY}`}});
  return res.data.choices[0].message.content;
 }catch(e){ console.log(e.message); return "Cerveau bug, retape boss 😅"; }
}
async function getAPI(url){ try{ const r=await axios.get(url,{headers:{'x-apisports-key':FOOT_API}}); return r.data.response||[]; }catch(e){ console.log(e.message); return []; } }
function fmt(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
client.on('messageCreate', async m=>{
 if(m.author.bot) return;
 const low=m.content.toLowerCase();
 if(m.mentions.has(client.user)){
  await m.channel.sendTyping();
  const q=m.content.replace(/<@!?[0-9]+>/g,'').trim()||"Salut";
  const rep=await cerveau(q);
  return m.reply(rep);
 }
 if(low.includes('rosa') &&!low.startsWith('!prono') &&!low.startsWith('!vip')){
  const rep=await cerveau(m.content);
  return m.reply(rep);
 }
 if(!low.startsWith('!prono')) return;
 let team=m.content.split(' ').slice(1).join(' ').toLowerCase().trim();
 let dateStr=fmt(new Date());
 if(low.includes('demain')){ const d=new Date(); d.setDate(d.getDate()+1); dateStr=fmt(d); team=team.replace('demain','').trim(); }
 if(low.includes('tous')) team='tous';
 let fx=await getAPI(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`);
 console.log(`API ${fx.length} matchs pour ${dateStr}`);
 if(fx.length===0) return m.reply(`⚠️ 0 match API pour ${dateStr}. Réessaie demain boss! Roma vs Real est à 21h ce soir!`);
 if(team==='tous' || team===''){
  const embed=new EmbedBuilder().setTitle(`📅 ${fx.length} Matchs - ${dateStr}`).setDescription(fx.slice(0,15).map(f=>`**${f.teams.home.name} vs ${f.teams.away.name}** - ${f.league.name}`).join('\n')).setColor(0x00FF00);
  return m.reply({embeds:[embed]});
 }
 let found=fx.filter(f=> f.teams.home.name.toLowerCase().includes(team) || f.teams.away.name.toLowerCase().includes(team));
 if(found.length===0) return m.reply(`⚠️ Aucun match pour "${team}" - Tape!prono tous`);
 const match=found[0];
 const embed=new EmbedBuilder().setTitle(`⚽ ${match.teams.home.name} vs ${match.teams.away.name}`).addFields({name:'🏆',value:match.league.name,inline:true},{name:'⏰',value:match.fixture.date.slice(11,16),inline:true},{name:'💎 Pronostic',value:`**${Math.random()>0.5?'BTTS OUI':'Over 2.5'}**`},{name:'💰 VIP',value:'WhatsApp +228 96 35 22 13'}).setColor(0xFFD700);
 return m.reply({embeds:[embed]});
});
client.once('ready',()=>console.log(`✅ ${client.user.tag} V11.1 OK`));
client.login(process.env.TOKEN);
