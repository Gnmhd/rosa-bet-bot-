const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('V8 ANTI JEUNE');}).listen(process.env.PORT||10000);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const KEY = process.env.FOOTBALL_API || process.env.FOOT_API;

async function getAPI(url){
  const r = await fetch(url,{headers:{"x-apisports-key":KEY}});
  const j = await r.json();
  return j.response||[];
}

function isSeniorMatch(f){
  const name = f.league.name.toLowerCase();
  const blacklist = ["u19","u20","u21","u23","u17","u18","youth","reserve","women","w.","academy","cup u"];
  return!blacklist.some(word => name.includes(word));
}

client.on('ready',()=>{console.log('V8 ANTI JEUNE READY'); client.user.setActivity("🏆 Matchs Pros Only |!prono");});

client.on('messageCreate', async msg=>{
  if(msg.author.bot) return;
  const lower = msg.content.toLowerCase();
  if(!lower.startsWith('!pronostic') &&!lower.startsWith('!prono')) return;
  const query = msg.content.split(' ').slice(1).join(' ').toLowerCase();
  await msg.channel.sendTyping().catch(()=>{});
  try{
    const today = new Date().toISOString().split('T')[0];
    let fixtures = await getAPI(`https://v3.football.api-sports.io/fixtures?date=${today}`);
    if(!fixtures.length) return msg.reply("Pas de match aujourd'hui");
    let seniorFixtures = fixtures.filter(isSeniorMatch);
    let list = seniorFixtures;
    if(query && query!=='tous'){
      list = seniorFixtures.filter(m=>
        m.teams.home.name.toLowerCase().includes(query) ||
        m.teams.away.name.toLowerCase().includes(query) ||
        m.league.name.toLowerCase().includes(query)
      );
    }
    if(query==='tous' || query===''){
      const embedList = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`📅 ${seniorFixtures.length} Matchs PRO - ${today}`)
      .setDescription(seniorFixtures.slice(0,20).map(f=>`**${f.teams.home.name} vs ${f.teams.away.name}** - ${f.league.name} - ${f.fixture.date.slice(11,16)} GMT`).join('\n'))
      .setFooter({text:`V8 ANTI-JEUNE: ${seniorFixtures.length} PRO sur ${fixtures.length} total 👑`});
      return msg.reply({embeds:[embedList]});
    }
    if(!list.length){
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      const date2 = tomorrow.toISOString().split('T')[0];
      let fixtures2 = await getAPI(`https://v3.football.api-sports.io/fixtures?date=${date2}`);
      let senior2 = fixtures2.filter(isSeniorMatch);
      if(senior2.length>0){
        return msg.reply(`⚠️ Aucun match PRO aujourd'hui (${fixtures.length - seniorFixtures.length} matchs jeunes filtrés). **${senior2.length} matchs pros demain.** Tape \`!pronostic\` demain ou teste \`!pronostic champions\` pour voir les matchs à venir.`);
      }
      return msg.reply(`❌ Aucun match PRO pour **${query}**. J'ai filtré ${fixtures.length - seniorFixtures.length} matchs jeunes.`);
    }
    const f = list[0];
    const [pred, odds] = await Promise.all([
      getAPI(`https://v3.football.api-sports.io/predictions?fixture=${f.fixture.id}`).catch(()=>[]),
      getAPI(`https://v3.football.api-sports.io/odds?fixture=${f.fixture.id}`).catch(()=>[])
    ]);
    let score = "2-1";
    let advice = "Over 1.5";
    let winner = f.teams.home.name;
    if(pred[0]){
      advice = pred[0].predictions.advice || advice;
      winner = pred[0].predictions.winner?.name || winner;
      const isHome = winner.toLowerCase().includes(f.teams.home.name.toLowerCase());
      const isAway = winner.toLowerCase().includes(f.teams.away.name.toLowerCase());
      if(isHome) score = ["2-1","2-0","1-0","2-1"][Math.floor(Math.random()*4)];
      else if(isAway) score = ["1-2","0-2","0-1","1-2"][Math.floor(Math.random()*4)];
      else score = ["1-1","2-2","1-1"][Math.floor(Math.random()*3)];
    }
    let bookText = "Cotes à venir (match proche)";
    if(odds[0] && odds[0].bookmakers && odds[0].bookmakers.length>0){
      const books = odds[0].bookmakers.slice(0,5);
      bookText = books.map(b=>{
        const bet = b.bets.find(x=>x.name==="Match Winner") || b.bets[0];
        const v = bet.values.map(v=>v.odd).join(' / ');
        return `**${b.name}**: ${v}`;
      }).join('\n');
    }
    const embed = new EmbedBuilder()
.setColor(0x00FF00)
.setTitle(`🏆 ${f.teams.home.name} vs ${f.teams.away.name}`)
.setThumbnail(f.league.logo)
.addFields(
      {name:'🏆 Compétition PRO', value: `${f.league.name} - ${f.league.round}\n${new Date(f.fixture.date).toLocaleString('fr-FR')}`, inline:false},
      {name:'🎯 SCORE EXACT ROSA-BET', value: `**>>> ${score} <<<**\nVainqueur: **${winner}**`, inline:false},
      {name:'💡 Conseil IA', value: advice, inline:true},
      {name:'📊 Confiance', value: `${89+Math.floor(Math.random()*6)}%`, inline:true},
      {name:'💰 COTES BOOKMAKERS', value: bookText, inline:false}
    )
.setFooter({text:`V8 ANTI-JEUNE: ${seniorFixtures.length} matchs pros sur ${fixtures.length} total aujourd'hui 👑`});
    msg.reply({embeds:[embed]});
  }catch(e){
    console.log(e);
    msg.reply("Erreur: "+e.message);
  }
});
client.login(process.env.TOKEN);
