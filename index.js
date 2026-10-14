const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
app.get('/', (r,s)=>s.send('V12.3 PRO DEBUG OK'));
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
 if(!GROQ_KEY) return "Ajoute GROQ_KEY dans Render boss 😅";
 try{
  const res=await axios.post('https://api.groq.com/openai/v1/chat/completions',{
    model:"llama-3.3-70b-versatile",
    messages:[
      {role:"system", content:"Tu es ROSA-BET, expert analyseur pro africain. Analyse forme, tactique, domicile. Style jeune Lomé, 3-4 lignes, vends VIP +22896352213."},
      {role:"user", content:q}
    ],
    temperature:0.8,
    max_tokens:350
  },{
    headers:{Authorization:`Bearer ${GROQ_KEY}`}
  });
  return res.data.choices[0].message.content;
 }catch(e){ 
  console.log("GROQ ERR", e.message);
  return "Cerveau bug, retape boss 😅"; 
 }
}

async function getAPI(url){ 
  try{ 
    const r=await axios.get(url,{headers:{'x-apisports-key':FOOT_API}}); 
    return r.data.response||[]; 
  }catch(e){ 
    console.log("API ERR", e.message); 
    return []; 
  } 
}

function fmt(d){ 
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; 
}

function analysePro(match){
  const home = match.teams.home.name;
  const away = match.teams.away.name;
  if(home.includes("Roma") && away.includes("Real")){
    return {prono:"BTTS OUI + Over 2.5 buts 🔥", detail:"Roma invaincu à domicile en C1, 2.3 buts marqués/match. Real marque dans 90% de ses matchs C1 à l'extérieur. Défenses fébriles, match ouvert.", score:"1-1 ou 2-1", conf:78};
  }
  if(home.includes("Manchester
