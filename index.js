const { Client, EmbedBuilder } = require('discord.js');
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('V9.3');}).listen(process.env.PORT||10000);
const client = new Client({ intents: [3276799] });
const KEY = process.env.FOOTBALL_API;
const vip = new Set();
const free = new Map();
async function getAPI(u){const r=await fetch(u,{headers:{"x-apisports-key":KEY}});const j=await r.json();return j.response;}
function senior(f){return!["u19","u20","u21","youth","reserve","women"].some(w=>f.league.name.toLowerCase().includes(w));}
client.on('ready',()=>console.log('V9.3 OK'));
client.on('messageCreate', async m=>{
if(m.author.bot) return;
const low=m.content.toLowerCase();
if(low==='!vip'){
const e=new EmbedBuilder().setColor(0xFFD700).setTitle('💎 ROSA-BET VIP +22896352213').setDescription('T-Money / Flooz / Wave: 96 35 22 13\nEnvoie capture WhatsApp').addFields({name:'Gratuit',value:'1/jour'},{name:'VIP 2000F',value:'Score exact illimite'});
return m.reply({embeds:[e]});
}
if(low.startsWith('!addvip')){
if(!m.member.permissions.has('Administrator')) return;
const u=m.mentions.users.first(); if(!u) return;
vip.add(u.id); return m.reply(`✅ ${u.username} VIP`);
}
if(!low.startsWith('!prono') &&!low.startsWith('!pronostic')) return;
const q=m.content.split(' ').slice(1).join(' ').toLowerCase();
const isVip=vip.has(m.author.id)||m.member.roles.cache.some(r=>r.name.toLowerCase().includes('vip'))||m.member.permissions.has('Administrator');
if(!isVip){
const d=new Date().toDateString();
if(free.get(m.author.id)===d) return m.reply('🔒 1/jour gratuit! Tape!vip +22896352213');
free.set(m.author.id,d);
}
await m.channel.sendTyping();
try{
const date=new Date().toISOString().split('T')[0];
let fx=await getAPI(`https://v3.football.api-sports.io/fixtures?date=${date}`);
let list=fx.filter(senior);
if(q) list=list.filter(x=>x.teams.home.name.toLowerCase().includes(q)||x.teams.away.name.toLowerCase().includes(q));
if(!list.length) return m.reply('Pas de match pro');
const f=list[0];
const pr=await getAPI(`https://v3.football.api-sports.io/predictions?fixture=${f.fixture.id}`).catch(()=>[]);
let sc="2-1"; let win=f.teams.home.name;
if(pr[0]){win=pr[0].predictions.winner?.name||win;}
if(!isVip){
const e=new EmbedBuilder().setColor(0x808080).setTitle(`${f.teams.home.name} vs ${f.teams.away.name}`).addFields({name:'Vainqueur',value:win},{name:'VIP',value:'Score exact:!vip 96 35 22 13'});
return m.reply({embeds:[e]});
}else{
const e=new EmbedBuilder().setColor(0xFFD700).setTitle(`💎 ${f.teams.home.name} vs ${f.teams.away.name}`).addFields({name:'SCORE VIP',value:`>>> ${sc} <<< ${win}`},{name:'Contact',value:'+22896352213'});
return m.reply({embeds:[e]});
}
}catch(err){m.reply('Erreur:'+err.message);}
});
client.login(process.env.TOKEN);
