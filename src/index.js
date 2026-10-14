const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end("Rosa Bet Bot is Live");}).listen(process.env.PORT || 10000, ()=>{console.log("HTTP server running for Render");});const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const TOKEN = process.env.TOKEN;
function genCode(){return "ROSA-"+Math.random().toString(36).substring(2,8).toUpperCase();}
function getCoupons(){
  return [
    {title:"COUPON SAFE - COTE 10",code:genCode(),matches:"Man City Win + Arsenal Double Chance + Over 1.5 Leipzig",odds:"10.45",color:0x2ECC71},
    {title:"COUPON COTE 20+",code:genCode(),matches:"Inter 1X + Barca BTTS + Real Over 2.5",odds:"22.30",color:0xF1C40F},
    {title:"COUPON FUN - COTE 50+",code:genCode(),matches:"Score Exact 2-0 Bayern + 3-1 PSG",odds:"54.80",color:0xE74C3C}
  ];
}
client.once('ready',()=>{console.log(`READY ${client.user.tag}`);});
client.on('messageCreate',async(message)=>{
  if(message.author.bot)return;
  if(message.content.toLowerCase().includes('!coupon')){
    const coupons=getCoupons();
    for(const c of coupons){
      const embed=new EmbedBuilder().setTitle(c.title).setDescription(`**Matchs:**\n${c.matches}\n\n**Code:** \`${c.code}\`\n**Cote: ${c.odds}**`).setColor(c.color).setTimestamp();
      await message.channel.send({embeds:[embed]});
    }
  }
});
client.login(TOKEN);
