/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com/Daedalline
 * ============================================
 */

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");

module.exports.run = async(interaction, config, maps, client) => {
    
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)
    
    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var sortable = [];
    for (var player in challenge_data) {
        var player_data = challenge_data[player];
        var totalLifetimeMedals = player_data["Lifetime"]["Participation Awards"] + player_data["Lifetime"]["Completion Awards"] + player_data["Lifetime"]["Coolest Shot From the Tee"] + player_data["Lifetime"]["Coolest Shot From Another Tee"] + player_data["Lifetime 9-Hole"]["Target Score Achieved"] + player_data["Lifetime 9-Hole"]["Target Score and Time Achieved"] + player_data["Lifetime 9-Hole"]["Top Score"];
        if (totalLifetimeMedals > 0) {
            sortable.push([player, totalLifetimeMedals]);
        }
    } 
    
    sortable.sort(function(a,b){
        return b[1] - a[1];
    });

    console.log(sortable);
    
    var tbl = "Work in Progress\n"; 
    var totalMedals = 0;
    var rank = 0;
    var previous_score = 1000;
    for (var i=0;i<sortable.length;i++) {
        //if (sortable[i][1] < previous_score)
        //{
        //    rank++;
        //}
        //previous_score = sortable[i][1];
        //tbl += `#${rank}: <@${sortable[i][0]}>   ${sortable[i][1]}\n`;
        //totalMedals += sortable[i][1];
    }
   
    var embed = new Discord.MessageEmbed()
    .setTitle("Total Lifetime Awards")
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "challenge-count",
    "description": "List the count of all users with a daily challenge lifetime and their total, sorted"
};