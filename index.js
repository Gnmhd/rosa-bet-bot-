const { Client, EmbedBuilder } = require('discord.js');
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('V9.2 FINAL');}).listen(process.env.PORT||10000);

const client = new Client({ intents: [3276799] });
const KEY = process.env.FOOTBALL_API;
const vipUsers = new Set();
const usageFree = new Map();

async function getAPI(url){
  const r = await fetch(url,{headers:{"x-apisports-key":KEY}});
  const j = await r.json();
  return j.response;
}
function isSenior(f){
  const b = ["u19","u20","u21","u23","youth","reserve","women","academy"];
  return!b.some(w=>f.league.name.toLowerCase().includes(w));
}

client.on('ready',()=>{console.log('V9.2 VIP FINAL READY');});

client.on('messageCreate', async msg=>{
  if(msg.author.bot) return;
  const low = msg.content.toLowerCase();

  if(low==='!vip'){
    const e = new EmbedBuilder().setColor(0xFFD700).setTitle('💎 ROSA-BET VIP')
   .addFields(
      {name:'🆓 Gratuit', value:'1 prono/jour', inline:true},
      {name:'💎 VIP 2000F/mois', value:'Score exact + Illimité', inline:true},
      {name:'📱 PAIEMENT +22896352213', value:'T-Money: 96 35 22 13\nFlooz: 96 35 22 13\nWave: +22896352213\n\nEnvoie capture WhatsApp', inline:false}
    ).setFooter({text:'ROSA-BET +22896352213'});
    return msg.reply({embeds:[e]});
  }

  if(low.startsWith('!addvip')){
    if(!msg.member.permissions.has('Administrator')) return;
    const u = msg.mentions.users.first();
    if(!u) return msg.reply('Usage:!addvip @user');
    vipUsers.add(u.id);
    return msg.reply(`✅ ${u.username} est VIP 💎`);
  }

  if(!low.startsWith('!pronostic') &&!low.startsWith('!prono')) return;

  const query = msg.content.split(' ').slice(1).join(' ').toLowerCase();
  const isVip = vipUsers.has(msg.author.id) || msg.member.roles.cache.some(r=>r.name.toLowerCase().includes('vip')) || msg.member.permissions.has('Administrator');

  if(!isVip){
    const today = new Date().toDateString();
    if(usageFree.get(msg.author.id)===today){
      return msg.reply('🔒 Limite 1/jour atteinte. Tape!vip - 2000F au 96 35 22 13');
    }
    usageFree.set(msg.author.id, today);
  }

  await msg.channel.sendTyping();
  try{
    const date = new Date().toISOString().split('T')[0];
    let fixtures
