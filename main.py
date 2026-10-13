import discord
from discord.ext import commands
from discord import app_commands
import os

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="!", intents=intents)

balances = {}

@bot.event
async def on_ready():
    print(f"ROSA-BET {bot.user} connectee")
    await bot.tree.sync()

@bot.tree.command(name="help", description="Aide ROSA-BET")
async def help_cmd(interaction: discord.Interaction):
    await interaction.response.send_message("👑 ROSA-BET-EMPIRE\n/bet - Parier\n/balance - Solde\n/stats - Stats\n/daily - Bonus quotidien")

@bot.tree.command(name="balance", description="Voir solde")
async def balance(interaction: discord.Interaction):
    solde = balances.get(interaction.user.id, 1000)
    await interaction.response.send_message(f"💰 {interaction.user.mention} : {solde} jetons")

@bot.tree.command(name="bet", description="Parier")
@app_commands.describe(montant="Montant", match="Match")
async def bet(interaction: discord.Interaction, montant: int, match: str):
    uid = interaction.user.id
    solde = balances.get(uid, 1000)
    if montant > solde:
        await interaction.response.send_message(f"❌ Solde insuffisant: {solde}", ephemeral=True)
        return
    balances[uid] = solde - montant
    await interaction.response.send_message(f"✅ Pari {montant} sur {match}! Nouveau solde: {balances[uid]}")

@bot.tree.command(name="daily", description="Bonus quotidien")
async def daily(interaction: discord.Interaction):
    balances[interaction.user.id] = balances.get(interaction.user.id, 1000) + 100
    await interaction.response.send_message(f"🎁 +100 jetons! Solde: {balances[interaction.user.id]}")

bot.run(os.getenv("TOKEN"))
